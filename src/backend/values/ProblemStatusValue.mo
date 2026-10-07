import Types "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : { #new; #inProgress; #resolved }) : Types.Value =
    #text(
      switch self {
        case (#new) "new";
        case (#inProgress) "inProgress";
        case (#resolved) "resolved";
      }
    );
};
