import Types "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : { #planned; #ongoing; #completed }) : Types.Value =
    #text(
      switch self {
        case (#planned) "planned";
        case (#ongoing) "ongoing";
        case (#completed) "completed";
      }
    );
};
