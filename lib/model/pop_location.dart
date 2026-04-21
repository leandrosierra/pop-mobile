class PopLocation {
  String id;
  String label;
  LocationType locationType;

  PopLocation(this.id, this.label, this.locationType);

  static PopLocation fromMap(Map value) {
    var locationType = LocationType.values.firstWhere(
        (e) => e.toString() == 'LocationType.${value['type'].toLowerCase()}');
    PopLocation location =
        PopLocation(value['code'], value['libelle'], locationType);
    return location;
  }

  @override
  String toString() {
    var type = locationType.toString().split(".")[1].toUpperCase();
    return '{"code": "$id", "libelle": "$label", "type": "$type"}';
  }

  @override
  bool operator ==(Object other) =>
      other is PopLocation &&
      id == other.id &&
      label == other.label &&
      locationType == other.locationType;

  @override
  int get hashCode => Object.hash(id, label, locationType);
}

enum LocationType { country, region, department, city, circonscription }
