import Types "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : ?Text) : Types.Value =
    switch self {
      case null #text("");
      case (?t) #text(t);
    };
};
