import Storage "mo:caffeineai-object-storage/Storage";
import Common "common";

module {
  public type ProblemId = Common.ProblemId;
  public type Timestamp = Common.Timestamp;

  public type ProblemCategory = {
    #water;
    #road;
    #electricity;
    #sanitation;
    #health;
    #education;
    #other;
  };

  public type ProblemStatus = {
    #new;
    #inProgress;
    #resolved;
  };

  public type GeoLocation = {
    latitude : Float;
    longitude : Float;
  };

  public type Problem = {
    id : ProblemId;
    title : Text;
    description : Text;
    category : ProblemCategory;
    status : ProblemStatus;
    reporterName : ?Text;
    reporterContact : ?Text;
    location : ?GeoLocation;
    photo : ?Storage.ExternalBlob;
    createdAt : Timestamp;
    updatedAt : Timestamp;
    upvotes : Nat;
  };

  public type StatusChange = {
    fromStatus : ProblemStatus;
    toStatus : ProblemStatus;
    changedAt : Timestamp;
  };

  public type OfficialResponse = {
    id : Common.ResponseId;
    problemId : ProblemId;
    message : Text;
    createdAt : Timestamp;
  };

  public type ProblemDetail = {
    problem : Problem;
    statusHistory : [StatusChange];
    responses : [OfficialResponse];
  };

  public type ProblemFilter = {
    category : ?ProblemCategory;
    status : ?ProblemStatus;
    search : ?Text;
  };

  public type ProblemInput = {
    title : Text;
    description : Text;
    category : ProblemCategory;
    reporterName : ?Text;
    reporterContact : ?Text;
    location : ?GeoLocation;
    photo : ?Storage.ExternalBlob;
  };

  public type ProblemStats = {
    total : Nat;
    open : Nat;
    resolved : Nat;
    byCategory : [(ProblemCategory, Nat)];
  };
};
