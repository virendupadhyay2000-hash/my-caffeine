import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type ProblemCategory = {
    #water;
    #road;
    #electricity;
    #sanitation;
    #health;
    #education;
    #other;
  };

  type ProblemStatus = {
    #new;
    #inProgress;
    #resolved;
  };

  type GeoLocation = {
    latitude : Float;
    longitude : Float;
  };

  type Problem = {
    id : Nat;
    title : Text;
    description : Text;
    category : ProblemCategory;
    status : ProblemStatus;
    reporterName : ?Text;
    reporterContact : ?Text;
    location : ?GeoLocation;
    photo : ?Blob;
    createdAt : Int;
    updatedAt : Int;
    upvotes : Nat;
  };

  type StatusChange = {
    fromStatus : ProblemStatus;
    toStatus : ProblemStatus;
    changedAt : Int;
  };

  type OfficialResponse = {
    id : Nat;
    problemId : Nat;
    message : Text;
    createdAt : Int;
  };

  type VillageProfile = {
    name : Text;
    population : Nat;
    households : Nat;
    areaSqKm : Float;
    facilities : [Text];
    updatedAt : Int;
  };

  type DevelopmentStatus = {
    #planned;
    #ongoing;
    #completed;
  };

  type DevelopmentUpdate = {
    id : Nat;
    title : Text;
    description : Text;
    status : DevelopmentStatus;
    budget : Nat;
    photo : ?Blob;
    createdAt : Int;
    updatedAt : Int;
  };

  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    problems : Map.Map<Nat, Problem>;
    statusHistory : Map.Map<Nat, List.List<StatusChange>>;
    responses : Map.Map<Nat, List.List<OfficialResponse>>;
    upvoters : Map.Map<Nat, Map.Map<Principal, Bool>>;
    problemState : { var nextProblemId : Nat; var nextResponseId : Nat };
    villageProfile : { var value : ?VillageProfile };
    developmentUpdates : Map.Map<Nat, DevelopmentUpdate>;
    villageState : { var nextDevelopmentId : Nat };
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      problems = Map.empty();
      statusHistory = Map.empty();
      responses = Map.empty();
      upvoters = Map.empty();
      problemState = { var nextProblemId = 0; var nextResponseId = 0 };
      villageProfile = { var value = null };
      developmentUpdates = Map.empty();
      villageState = { var nextDevelopmentId = 0 };
    };
  };
};
