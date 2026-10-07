import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/village";

module {
  // Default public contact details shown until an admin saves their own.
  let defaultContactSettings : Types.ContactSettings = {
    email = "Virendupadhyay.2000@gmail.com";
    phone = "+91 94131 44022";
  };

  public func getContactSettings(
    settings : { var value : ?Types.ContactSettings },
  ) : Types.ContactSettings {
    settings.value ?? defaultContactSettings;
  };

  public func updateContactSettings(
    settings : { var value : ?Types.ContactSettings },
    email : Text,
    phone : Text,
  ) : Types.ContactSettings {
    let updated : Types.ContactSettings = { email; phone };
    settings.value := ?updated;
    updated;
  };

  public func getVillageProfile(
    profile : { var value : ?Types.VillageProfile },
  ) : ?Types.VillageProfile {
    profile.value;
  };

  public func setVillageProfile(
    profile : { var value : ?Types.VillageProfile },
    input : Types.VillageProfile,
  ) : Types.VillageProfile {
    let updated : Types.VillageProfile = {
      name = input.name;
      population = input.population;
      households = input.households;
      areaSqKm = input.areaSqKm;
      facilities = input.facilities;
      updatedAt = Time.now();
    };
    profile.value := ?updated;
    updated;
  };

  public func listDevelopmentUpdates(
    updates : Map.Map<Types.DevelopmentId, Types.DevelopmentUpdate>,
  ) : [Types.DevelopmentUpdate] {
    let all = updates.values().toArray();
    all.sort(
      func(a, b) {
        if (a.createdAt > b.createdAt) { #less }
        else if (a.createdAt < b.createdAt) { #greater }
        else { #equal };
      }
    );
  };

  public func getDevelopmentUpdate(
    updates : Map.Map<Types.DevelopmentId, Types.DevelopmentUpdate>,
    id : Types.DevelopmentId,
  ) : ?Types.DevelopmentUpdate {
    updates.get(id);
  };

  public func createDevelopmentUpdate(
    updates : Map.Map<Types.DevelopmentId, Types.DevelopmentUpdate>,
    state : { var nextDevelopmentId : Nat },
    input : Types.DevelopmentInput,
  ) : Types.DevelopmentUpdate {
    let id = state.nextDevelopmentId;
    state.nextDevelopmentId := id + 1;
    let now = Time.now();
    let update : Types.DevelopmentUpdate = {
      id;
      title = input.title;
      description = input.description;
      status = input.status;
      budget = input.budget;
      photo = input.photo;
      createdAt = now;
      updatedAt = now;
    };
    updates.add(id, update);
    update;
  };

  public func updateDevelopmentUpdate(
    updates : Map.Map<Types.DevelopmentId, Types.DevelopmentUpdate>,
    id : Types.DevelopmentId,
    input : Types.DevelopmentInput,
  ) : ?Types.DevelopmentUpdate {
    switch (updates.get(id)) {
      case null { null };
      case (?existing) {
        let updated : Types.DevelopmentUpdate = {
          id = existing.id;
          title = input.title;
          description = input.description;
          status = input.status;
          budget = input.budget;
          photo = input.photo;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
        };
        updates.add(id, updated);
        ?updated;
      };
    };
  };

  public func deleteDevelopmentUpdate(
    updates : Map.Map<Types.DevelopmentId, Types.DevelopmentUpdate>,
    id : Types.DevelopmentId,
  ) : Bool {
    switch (updates.get(id)) {
      case null { false };
      case (?_) {
        updates.remove(id);
        true;
      };
    };
  };

  public func getVillageDashboard(
    profile : { var value : ?Types.VillageProfile },
    updates : Map.Map<Types.DevelopmentId, Types.DevelopmentUpdate>,
  ) : Types.VillageDashboard {
    var developmentCount = 0;
    var ongoingCount = 0;
    var completedCount = 0;
    for (update in updates.values()) {
      developmentCount += 1;
      switch (update.status) {
        case (#ongoing) { ongoingCount += 1 };
        case (#completed) { completedCount += 1 };
        case (#planned) {};
      };
    };
    {
      profile = profile.value;
      developmentCount;
      ongoingCount;
      completedCount;
    };
  };
};
