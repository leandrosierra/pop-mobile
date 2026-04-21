import 'dart:io';

import 'package:pop/constants.dart';
import 'package:pop/exception/pop_service_exception.dart';
import 'package:pop/model/pop_question.dart';
import 'package:pop/service/auth_service.dart';
import 'package:pop/service_locator.dart';
import 'dart:convert' as convert;
import 'package:http/http.dart' as http;

class PopAdminService {
  final AuthService authService = locator<AuthService>();

  Future<Map<String, List<PopQuestion>>> getAllQuestion() async {
    var url = Uri.https(popapiurl, '/pop/questions');
    var jwt = await authService.getCurrentUserAccessToken();

    var response = await http
        .get(url, headers: {HttpHeaders.authorizationHeader: 'Bearer $jwt'});
    if (response.statusCode == 200) {
      var jsonResponse = convert.jsonDecode(
          const convert.Utf8Decoder().convert(response.bodyBytes)) as Map;
      return _convertMap(jsonResponse);
    } else {
      throw PopServiceException("Unable to serve request.");
    }
  }

  Future<void> setQuestionStatus(String status, int questionId) async {
    var url = Uri.https(popapiurl, '/pop/questions/$questionId/status');
    var jwt = await authService.getCurrentUserAccessToken();
    var request = http.Request('PUT', url);
    var headers = {
      HttpHeaders.authorizationHeader: 'Bearer $jwt',
      HttpHeaders.contentTypeHeader: 'application/json'
    };
    request.body = '{"status": "$status"}';
    request.headers.addAll(headers);

    http.StreamedResponse response = await request.send();
    if (response.statusCode == 202) {
      return;
    } else {
      throw PopServiceException("Unable to serve request.");
    }
  }

  Map<String, List<PopQuestion>> _convertMap(Map map) {
    Map<String, List<PopQuestion>> result = {};
    map.forEach((key, value) {
      value = List<PopQuestion>.from(value.map((e) => PopQuestion.fromMap(e)));
      result[key] = value;
    });

    return result; //Map<String, List<PopQuestion>>.from(map);
  }
}
