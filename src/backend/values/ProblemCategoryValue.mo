import Types "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : {
    #water;
    #road;
    #electricity;
    #sanitation;
    #health;
    #education;
    #other;
  }) : Types.Value =
    #text(
      switch self {
        case (#water) "water";
        case (#road) "road";
        case (#electricity) "electricity";
        case (#sanitation) "sanitation";
        case (#health) "health";
        case (#education) "education";
        case (#other) "other";
      }
    );
};
