import 'package:quiver/core.dart';

class PopInterest {
  String code;
  String label;

  PopInterest(this.code, this.label);

  @override
  String toString() {
    return '{"code": "$code", "libelle": "$label"}';
  }

  static PopInterest fromMap(map) {
    return PopInterest(map['code'], map['libelle']);
  }

  @override
  bool operator ==(other) =>
      other is PopInterest && code == other.code && label == other.label;
  @override
  int get hashCode => hash2(code.hashCode, label.hashCode);
}
