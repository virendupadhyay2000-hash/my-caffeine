import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Expose "mo:caffeineai-oql/Expose";
import MapEntity "mo:caffeineai-oql/MapEntity";
import Entity "mo:caffeineai-oql/Entity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import IntValue "mo:caffeineai-oql/IntValue";
import FloatValue "mo:caffeineai-oql/FloatValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import ProblemCategoryValue "values/ProblemCategoryValue";
import ProblemStatusValue "values/ProblemStatusValue";
import DevelopmentStatusValue "values/DevelopmentStatusValue";
import OptTextValue "values/OptTextValue";
import OptGeoLocationValue "values/OptGeoLocationValue";
import OptExternalBlobValue "values/OptExternalBlobValue";
import ProblemsTypes "types/problems";
import VillageTypes "types/village";
import ProblemsApi "mixins/problems-api";
import VillageApi "mixins/village-api";
import VillageLib "lib/village";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;

  let problems : Map.Map<ProblemsTypes.ProblemId, ProblemsTypes.Problem>;
  let statusHistory : Map.Map<ProblemsTypes.ProblemId, List.List<ProblemsTypes.StatusChange>>;
  let responses : Map.Map<ProblemsTypes.ProblemId, List.List<ProblemsTypes.OfficialResponse>>;
  let upvoters : Map.Map<ProblemsTypes.ProblemId, Map.Map<Principal, Bool>>;
  let problemState : { var nextProblemId : Nat; var nextResponseId : Nat };

  let villageProfile : { var value : ?VillageTypes.VillageProfile };
  let developmentUpdates : Map.Map<VillageTypes.DevelopmentId, VillageTypes.DevelopmentUpdate>;
  let villageState : { var nextDevelopmentId : Nat };
  let contactSettings : { var value : ?VillageTypes.ContactSettings };

  include MixinAuthorization(accessControlState, null);
  include MixinObjectStorage();

  include ProblemsApi(
    accessControlState,
    problems,
    statusHistory,
    responses,
    upvoters,
    problemState,
  );

  include VillageApi(
    accessControlState,
    villageProfile,
    developmentUpdates,
    villageState,
    contactSettings,
  );

  include ApiDocMixin();

  // Flatten the per-problem status history into one row per status change.
  func statusHistoryRows() : Iter.Iter<(Nat, ProblemsTypes.StatusChange)> {
    let out = List.empty<(Nat, ProblemsTypes.StatusChange)>();
    for ((problemId, changes) in statusHistory.entries()) {
      for (change in changes.values()) {
        out.add((problemId, change));
      };
    };
    out.values();
  };

  // Flatten the per-problem official responses into one row per response.
  func responseRows() : Iter.Iter<(Nat, ProblemsTypes.OfficialResponse)> {
    let out = List.empty<(Nat, ProblemsTypes.OfficialResponse)>();
    for ((problemId, problemResponses) in responses.entries()) {
      for (response in problemResponses.values()) {
        out.add((problemId, response));
      };
    };
    out.values();
  };

  // Flatten the per-problem upvoter maps into one row per (problem, voter).
  func upvoterRows() : Iter.Iter<(Nat, Principal)> {
    let out = List.empty<(Nat, Principal)>();
    for ((problemId, voters) in upvoters.entries()) {
      for (voter in voters.keys()) {
        out.add((problemId, voter));
      };
    };
    out.values();
  };

  // The village profile is a single optional record; yield it as zero or one row.
  func villageProfileRows() : Iter.Iter<VillageTypes.VillageProfile> {
    switch (villageProfile.value) {
      case (?profile) [profile].values();
      case null ([] : [VillageTypes.VillageProfile]).values();
    };
  };

  // Contact settings always resolve to a value (defaults when unsaved).
  func contactSettingsRows() : Iter.Iter<VillageTypes.ContactSettings> {
    [VillageLib.getContactSettings(contactSettings)].values();
  };

  include Expose({
    entities = [
      problems.toEntity("problem", "Problem", "id")
        .sample({
          id = 0;
          title = "";
          description = "";
          category = #other;
          status = #new;
          reporterName = null;
          reporterContact = null;
          location = null;
          photo = null;
          createdAt = 0;
          updatedAt = 0;
          upvotes = 0;
        })
        .public_()
        .build(),
      Entity.manual<(Nat, ProblemsTypes.StatusChange)>(
        "statusHistory",
        statusHistoryRows,
        "StatusChange",
        "id",
      )
        .sample((0, { fromStatus = #new; toStatus = #inProgress; changedAt = 0 }))
        .payload("id", func ((problemId, change)) = problemId.toText() # ":" # change.changedAt.toText())
        .payload("problemId", func ((problemId, _)) = problemId)
        .edge("problemId", "problem")
        .flatten(func ((_, change)) = change)
        .public_()
        .build(),
      Entity.manual<(Nat, ProblemsTypes.OfficialResponse)>(
        "response",
        responseRows,
        "OfficialResponse",
        "id",
      )
        .sample((0, { id = 0; problemId = 0; message = ""; createdAt = 0 }))
        .flatten(func ((_, response)) = response)
        .edge("problemId", "problem")
        .public_()
        .build(),
      Entity.manual<(Nat, Principal)>(
        "upvote",
        upvoterRows,
        "Upvote",
        "id",
      )
        .sample((0, Principal.fromText("aaaaa-aa")))
        .payload("id", func ((problemId, voter)) = problemId.toText() # ":" # voter.toText())
        .payload("problemId", func ((problemId, _)) = problemId)
        .edge("problemId", "problem")
        .payload("voter", func ((_, voter)) = voter)
        .controllerOnly()
        .build(),
      Entity.manual<VillageTypes.VillageProfile>(
        "villageProfile",
        villageProfileRows,
        "VillageProfile",
        "name",
      )
        .sample({
          name = "";
          population = 0;
          households = 0;
          areaSqKm = 0.0;
          facilities = [];
          updatedAt = 0;
        })
        .payload("name", func (profile) = profile.name)
        .payload("population", func (profile) = profile.population)
        .payload("households", func (profile) = profile.households)
        .payload("areaSqKm", func (profile) = profile.areaSqKm)
        .payload("facilities", func (profile) = profile.facilities.values().join(", "))
        .payload("updatedAt", func (profile) = profile.updatedAt)
        .public_()
        .build(),
      developmentUpdates.toEntity("developmentUpdate", "DevelopmentUpdate", "id")
        .sample({
          id = 0;
          title = "";
          description = "";
          status = #planned;
          budget = 0;
          photo = null;
          createdAt = 0;
          updatedAt = 0;
        })
        .public_()
        .build(),
      Entity.manual<VillageTypes.ContactSettings>(
        "contactSettings",
        contactSettingsRows,
        "ContactSettings",
        "email",
      )
        .sample({ email = ""; phone = "" })
        .payload("email", func (settings) = settings.email)
        .payload("phone", func (settings) = settings.phone)
        .public_()
        .build(),
    ];
  });
};
