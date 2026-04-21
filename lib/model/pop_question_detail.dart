import 'package:pop/model/pop_interest.dart';
import 'package:pop/model/pop_location.dart';

class PopQuestionDetail {
  int id;
  String questionTitle;
  String questionDesc;
  List<PopLocation> geoTags;
  List<PopInterest> interestTags;
  QuestionStats stats;

  PopQuestionDetail(this.id, this.questionTitle, this.questionDesc,
      this.geoTags, this.interestTags, this.stats);

  static fromMap(Map value) {
    var geoTags = value['geoTags']
        .map<PopLocation>((geo) => PopLocation.fromMap(geo))
        .toList();
    var interestTags = value['interestTags']
        .map<PopInterest>((intr) => PopInterest.fromMap(intr))
        .toList();
    PopQuestionDetail question = PopQuestionDetail(
        value['id'],
        value['questionTitle'],
        value['questionDesc'],
        geoTags,
        interestTags,
        QuestionStats.fromMap(value['stats']));
    return question;
  }
}

class QuestionStats {
  int yes;
  int no;
  int neutral;

  QuestionStats(this.yes, this.no, this.neutral);

  static fromMap(Map value) {
    return QuestionStats(value['yes'], value['no'], value['neutral']);
  }

  @override
  String toString() {
    return "yes: $yes, no : $no, neutral: $neutral";
  }
}
