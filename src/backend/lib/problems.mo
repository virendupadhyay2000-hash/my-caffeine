import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/problems";

module {
  public func listProblems(
    problems : Map.Map<Types.ProblemId, Types.Problem>,
    filter : Types.ProblemFilter,
  ) : [Types.Problem] {
    let searchTerm = switch (filter.search) {
      case (?s) { ?s.toLower() };
      case null { null };
    };

    let matched = problems.values().filter(
      func(problem) {
        let categoryOk = switch (filter.category) {
          case (?c) { problem.category == c };
          case null { true };
        };
        let statusOk = switch (filter.status) {
          case (?s) { problem.status == s };
          case null { true };
        };
        let searchOk = switch (searchTerm) {
          case (?term) {
            problem.title.toLower().contains(#text term)
              or problem.description.toLower().contains(#text term);
          };
          case null { true };
        };
        categoryOk and statusOk and searchOk;
      }
    ).toArray();

    matched.sort(
      func(a, b) {
        if (a.createdAt > b.createdAt) { #less }
        else if (a.createdAt < b.createdAt) { #greater }
        else { #equal };
      }
    );
  };

  public func getProblem(
    problems : Map.Map<Types.ProblemId, Types.Problem>,
    id : Types.ProblemId,
  ) : ?Types.Problem {
    problems.get(id);
  };

  public func getProblemDetail(
    problems : Map.Map<Types.ProblemId, Types.Problem>,
    statusHistory : Map.Map<Types.ProblemId, List.List<Types.StatusChange>>,
    responses : Map.Map<Types.ProblemId, List.List<Types.OfficialResponse>>,
    id : Types.ProblemId,
  ) : ?Types.ProblemDetail {
    switch (problems.get(id)) {
      case null { null };
      case (?problem) {
        let history = switch (statusHistory.get(id)) {
          case (?list) { list.toArray() };
          case null { [] };
        };
        let officialResponses = switch (responses.get(id)) {
          case (?list) { list.toArray() };
          case null { [] };
        };
        ?{
          problem;
          statusHistory = history;
          responses = officialResponses;
        };
      };
    };
  };

  public func createProblem(
    problems : Map.Map<Types.ProblemId, Types.Problem>,
    statusHistory : Map.Map<Types.ProblemId, List.List<Types.StatusChange>>,
    state : { var nextProblemId : Nat },
    input : Types.ProblemInput,
  ) : Types.Problem {
    let id = state.nextProblemId;
    state.nextProblemId := id + 1;
    let now = Time.now();
    let problem : Types.Problem = {
      id;
      title = input.title;
      description = input.description;
      category = input.category;
      status = #new;
      reporterName = input.reporterName;
      reporterContact = input.reporterContact;
      location = input.location;
      photo = input.photo;
      createdAt = now;
      updatedAt = now;
      upvotes = 0;
    };
    problems.add(id, problem);
    let history = List.empty<Types.StatusChange>();
    history.add({ fromStatus = #new; toStatus = #new; changedAt = now });
    statusHistory.add(id, history);
    problem;
  };

  public func upvoteProblem(
    problems : Map.Map<Types.ProblemId, Types.Problem>,
    upvoters : Map.Map<Types.ProblemId, Map.Map<Principal, Bool>>,
    id : Types.ProblemId,
    caller : Principal,
  ) : ?Nat {
    switch (problems.get(id)) {
      case null { null };
      case (?problem) {
        let voters = switch (upvoters.get(id)) {
          case (?existing) { existing };
          case null {
            let fresh = Map.empty<Principal, Bool>();
            upvoters.add(id, fresh);
            fresh;
          };
        };
        if (voters.get(caller) != null) {
          ?problem.upvotes;
        } else {
          voters.add(caller, true);
          let updated : Types.Problem = {
            id = problem.id;
            title = problem.title;
            description = problem.description;
            category = problem.category;
            status = problem.status;
            reporterName = problem.reporterName;
            reporterContact = problem.reporterContact;
            location = problem.location;
            photo = problem.photo;
            createdAt = problem.createdAt;
            updatedAt = problem.updatedAt;
            upvotes = problem.upvotes + 1;
          };
          problems.add(id, updated);
          ?updated.upvotes;
        };
      };
    };
  };

  public func updateProblemStatus(
    problems : Map.Map<Types.ProblemId, Types.Problem>,
    statusHistory : Map.Map<Types.ProblemId, List.List<Types.StatusChange>>,
    id : Types.ProblemId,
    status : Types.ProblemStatus,
  ) : ?Types.Problem {
    switch (problems.get(id)) {
      case null { null };
      case (?problem) {
        let now = Time.now();
        let updated : Types.Problem = {
          id = problem.id;
          title = problem.title;
          description = problem.description;
          category = problem.category;
          status;
          reporterName = problem.reporterName;
          reporterContact = problem.reporterContact;
          location = problem.location;
          photo = problem.photo;
          createdAt = problem.createdAt;
          updatedAt = now;
          upvotes = problem.upvotes;
        };
        problems.add(id, updated);
        let history = switch (statusHistory.get(id)) {
          case (?existing) { existing };
          case null {
            let fresh = List.empty<Types.StatusChange>();
            statusHistory.add(id, fresh);
            fresh;
          };
        };
        history.add({ fromStatus = problem.status; toStatus = status; changedAt = now });
        ?updated;
      };
    };
  };

  public func addOfficialResponse(
    problems : Map.Map<Types.ProblemId, Types.Problem>,
    responses : Map.Map<Types.ProblemId, List.List<Types.OfficialResponse>>,
    state : { var nextResponseId : Nat },
    id : Types.ProblemId,
    message : Text,
  ) : ?Types.OfficialResponse {
    switch (problems.get(id)) {
      case null { null };
      case (?problem) {
        let responseId = state.nextResponseId;
        state.nextResponseId := responseId + 1;
        let now = Time.now();
        let response : Types.OfficialResponse = {
          id = responseId;
          problemId = id;
          message;
          createdAt = now;
        };
        let list = switch (responses.get(id)) {
          case (?existing) { existing };
          case null {
            let fresh = List.empty<Types.OfficialResponse>();
            responses.add(id, fresh);
            fresh;
          };
        };
        list.add(response);
        let updated : Types.Problem = {
          id = problem.id;
          title = problem.title;
          description = problem.description;
          category = problem.category;
          status = problem.status;
          reporterName = problem.reporterName;
          reporterContact = problem.reporterContact;
          location = problem.location;
          photo = problem.photo;
          createdAt = problem.createdAt;
          updatedAt = now;
          upvotes = problem.upvotes;
        };
        problems.add(id, updated);
        ?response;
      };
    };
  };

  public func getProblemStats(
    problems : Map.Map<Types.ProblemId, Types.Problem>,
  ) : Types.ProblemStats {
    var total = 0;
    var open = 0;
    var resolved = 0;
    var water = 0;
    var road = 0;
    var electricity = 0;
    var sanitation = 0;
    var health = 0;
    var education = 0;
    var other = 0;

    for (problem in problems.values()) {
      total += 1;
      switch (problem.status) {
        case (#resolved) { resolved += 1 };
        case (_) { open += 1 };
      };
      switch (problem.category) {
        case (#water) { water += 1 };
        case (#road) { road += 1 };
        case (#electricity) { electricity += 1 };
        case (#sanitation) { sanitation += 1 };
        case (#health) { health += 1 };
        case (#education) { education += 1 };
        case (#other) { other += 1 };
      };
    };

    {
      total;
      open;
      resolved;
      byCategory = [
        (#water, water),
        (#road, road),
        (#electricity, electricity),
        (#sanitation, sanitation),
        (#health, health),
        (#education, education),
        (#other, other),
      ];
    };
  };
};
