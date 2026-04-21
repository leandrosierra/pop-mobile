import 'package:pop/model/pop_location.dart';
import 'dart:convert';

class PopQuestionRequest {
  String questionTitle;
  String questionDesc;
  List<PopLocation> geoTags;
  List<String> interestTags;

  PopQuestionRequest(
      this.questionTitle, this.questionDesc, this.geoTags, this.interestTags);

  @override
  String toString() {
    return '{"questionTitle": "$questionTitle", "questionDesc": ${jsonEncode(questionDesc)}, "geoTags": $geoTags, "interestTags": ${jsonEncode(interestTags)}}';
  }
}
