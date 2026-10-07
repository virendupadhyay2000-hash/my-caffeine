import Storage "mo:caffeineai-object-storage/Storage";
import Common "common";

module {
  public type DevelopmentId = Common.DevelopmentId;
  public type Timestamp = Common.Timestamp;

  public type VillageProfile = {
    name : Text;
    population : Nat;
    households : Nat;
    areaSqKm : Float;
    facilities : [Text];
    updatedAt : Timestamp;
  };

  public type DevelopmentStatus = {
    #planned;
    #ongoing;
    #completed;
  };

  public type DevelopmentUpdate = {
    id : DevelopmentId;
    title : Text;
    description : Text;
    status : DevelopmentStatus;
    budget : Nat;
    photo : ?Storage.ExternalBlob;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  public type DevelopmentInput = {
    title : Text;
    description : Text;
    status : DevelopmentStatus;
    budget : Nat;
    photo : ?Storage.ExternalBlob;
  };

  public type VillageDashboard = {
    profile : ?VillageProfile;
    developmentCount : Nat;
    ongoingCount : Nat;
    completedCount : Nat;
  };

  public type ContactSettings = {
    email : Text;
    phone : Text;
  };
};
