import 'package:flutter/material.dart';

class UserInterest {
  String code;
  String label;
  int priority;

  UserInterest(this.code, this.label, this.priority);

  static UserInterest fromMap(value) {
    return UserInterest(value['code'], value['libelle'], value['priority']);
  }

  @override
  String toString() {
    return '{"code": "$code", "libelle": "$label", "priority": "$priority"}';
  }

  @override
  bool operator ==(Object other) =>
      other is UserInterest &&
      code == other.code &&
      label == other.label &&
      priority == other.priority;

  @override
  int get hashCode => hashValues(code, label, priority);
}
