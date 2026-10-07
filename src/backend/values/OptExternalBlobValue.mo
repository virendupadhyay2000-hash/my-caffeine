import Types "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : ?Blob) : Types.Value =
    switch self {
      case null #text("");
      case (?b) {
        switch (b.decodeUtf8()) {
          case (?t) #text(t);
          case null #text("<blob:" # b.size().toText() # " bytes>");
        };
      };
    };
};
