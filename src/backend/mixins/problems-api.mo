import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/problems";
import ProblemsLib "../lib/problems";
import AuthLib "../lib/auth";

mixin (
  accessControlState : AccessControl.AccessControlState,
  problems : Map.Map<Types.ProblemId, Types.Problem>,
  statusHistory : Map.Map<Types.ProblemId, List.List<Types.StatusChange>>,
  responses : Map.Map<Types.ProblemId, List.List<Types.OfficialResponse>>,
  upvoters : Map.Map<Types.ProblemId, Map.Map<Principal, Bool>>,
  problemState : { var nextProblemId : Nat; var nextResponseId : Nat },
) {
  public query func listProblems(filter : Types.ProblemFilter) : async [Types.Problem] {
    ProblemsLib.listProblems(problems, filter);
  };

  public query func getProblem(id : Types.ProblemId) : async ?Types.Problem {
    ProblemsLib.getProblem(problems, id);
  };

  public query func getProblemDetail(id : Types.ProblemId) : async ?Types.ProblemDetail {
    ProblemsLib.getProblemDetail(problems, statusHistory, responses, id);
  };

  public shared ({ caller }) func createProblem(input : Types.ProblemInput) : async Types.Problem {
    ignore caller;
    ProblemsLib.createProblem(problems, statusHistory, problemState, input);
  };

  public shared ({ caller }) func upvoteProblem(id : Types.ProblemId) : async ?Nat {
    ProblemsLib.upvoteProblem(problems, upvoters, id, caller);
  };

  public shared ({ caller }) func updateProblemStatus(
    id : Types.ProblemId,
    status : Types.ProblemStatus,
  ) : async ?Types.Problem {
    if (not AuthLib.isAdmin(accessControlState, caller)) {
      return null;
    };
    ProblemsLib.updateProblemStatus(problems, statusHistory, id, status);
  };

  public shared ({ caller }) func addOfficialResponse(
    id : Types.ProblemId,
    message : Text,
  ) : async ?Types.OfficialResponse {
    if (not AuthLib.isAdmin(accessControlState, caller)) {
      return null;
    };
    ProblemsLib.addOfficialResponse(problems, responses, problemState, id, message);
  };

  public query func getProblemStats() : async Types.ProblemStats {
    ProblemsLib.getProblemStats(problems);
  };
};
