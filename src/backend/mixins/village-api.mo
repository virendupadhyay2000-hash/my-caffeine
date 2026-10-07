import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/village";
import VillageLib "../lib/village";
import AuthLib "../lib/auth";

mixin (
  accessControlState : AccessControl.AccessControlState,
  villageProfile : { var value : ?Types.VillageProfile },
  developmentUpdates : Map.Map<Types.DevelopmentId, Types.DevelopmentUpdate>,
  villageState : { var nextDevelopmentId : Nat },
  contactSettings : { var value : ?Types.ContactSettings },
) {
  public query func getContactSettings() : async Types.ContactSettings {
    VillageLib.getContactSettings(contactSettings);
  };

  public shared ({ caller }) func updateContactSettings(email : Text, phone : Text) : async Types.ContactSettings {
    if (not AuthLib.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update contact settings");
    };
    if (email == "" or phone == "") {
      Runtime.trap("Email and phone must not be empty");
    };
    VillageLib.updateContactSettings(contactSettings, email, phone);
  };

  public query func getVillageProfile() : async ?Types.VillageProfile {
    VillageLib.getVillageProfile(villageProfile);
  };

  public shared ({ caller }) func setVillageProfile(input : Types.VillageProfile) : async Types.VillageProfile {
    if (not AuthLib.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update the village profile");
    };
    VillageLib.setVillageProfile(villageProfile, input);
  };

  public query func listDevelopmentUpdates() : async [Types.DevelopmentUpdate] {
    VillageLib.listDevelopmentUpdates(developmentUpdates);
  };

  public query func getDevelopmentUpdate(id : Types.DevelopmentId) : async ?Types.DevelopmentUpdate {
    VillageLib.getDevelopmentUpdate(developmentUpdates, id);
  };

  public shared ({ caller }) func createDevelopmentUpdate(input : Types.DevelopmentInput) : async Types.DevelopmentUpdate {
    if (not AuthLib.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create development updates");
    };
    VillageLib.createDevelopmentUpdate(developmentUpdates, villageState, input);
  };

  public shared ({ caller }) func updateDevelopmentUpdate(
    id : Types.DevelopmentId,
    input : Types.DevelopmentInput,
  ) : async ?Types.DevelopmentUpdate {
    if (not AuthLib.isAdmin(accessControlState, caller)) {
      return null;
    };
    VillageLib.updateDevelopmentUpdate(developmentUpdates, id, input);
  };

  public shared ({ caller }) func deleteDevelopmentUpdate(id : Types.DevelopmentId) : async Bool {
    if (not AuthLib.isAdmin(accessControlState, caller)) {
      return false;
    };
    VillageLib.deleteDevelopmentUpdate(developmentUpdates, id);
  };

  public query func getVillageDashboard() : async Types.VillageDashboard {
    VillageLib.getVillageDashboard(villageProfile, developmentUpdates);
  };
};
