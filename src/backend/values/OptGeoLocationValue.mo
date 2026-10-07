import Types "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : ?{ latitude : Float; longitude : Float }) : Types.Value =
    switch self {
      case null #text("");
      case (?loc) #text(loc.latitude.toText() # "," # loc.longitude.toText());
    };
};
