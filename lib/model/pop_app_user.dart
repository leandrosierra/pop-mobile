import 'package:pop/model/pop_location.dart';
import 'package:pop/model/user_interest.dart';

class PopAppUser {
  String uid;
  String name;
  String emailId;
  String role;
  List<PopLocation> userChoiceGeo = [];
  List<UserInterest> userInterest = [];

  PopAppUser(this.uid, this.name, this.emailId, this.role, this.userChoiceGeo,
      this.userInterest);

  toMap() {
    Map map = <String, dynamic>{};
    map['uid'] = uid;
    map['name'] = name;
    map['emailId'] = emailId;
    return map;
  }

  static fromMap(Map value) {
    var interestList = value['interest']
        .map<UserInterest>((value) => UserInterest.fromMap(value))
        .toList();
    List<PopLocation> geoList = value['userChoiceGeoDtoList']
        .map<PopLocation>((value) => PopLocation.fromMap(value))
        .toList();
    PopAppUser user = PopAppUser(value['uid'], value['name'], value['email'],
        value['role'], geoList, interestList);
    return user;
  }
}
