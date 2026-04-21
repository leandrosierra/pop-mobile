import 'dart:io';

import 'package:pop/constants.dart';
import 'dart:convert' as convert;
import 'package:http/http.dart' as http;
import 'package:pop/model/pop_answered_question.dart';
import 'package:pop/model/pop_interest.dart';
import 'package:pop/model/pop_location.dart';
import 'package:pop/model/pop_question.dart';
import 'package:pop/model/pop_question_detail.dart';
import 'package:pop/model/pop_question_request.dart';
import 'package:pop/model/user_interest.dart';
import 'package:pop/service/auth_service.dart';
import 'package:pop/service_locator.dart';

import '../exception/pop_service_exception.dart';

class PopService {
  final AuthService authService = locator<AuthService>();

  Future<List<PopInterest>> getAllPopInterest() async {
    var url = Uri.https(popapiurl, '/pop/referential/interests');
    var response = await http.get(url);
    if (response.statusCode == 200) {
      var jsonResponse = convert.jsonDecode(
              const convert.Utf8Decoder().convert(response.bodyBytes))
          as Map<String, dynamic>;
      return jsonResponse['interestList']
          .map<PopInterest>((intr) => PopInterest.fromMap(intr))
          .toList();
    } else {
      throw PopServiceException("Unable to serve request.");
    }
  }

  Future<List<PopLocation>> searchReferential(
      String searchText, int page) async {
    List<PopLocation> locations = [];

    var url = Uri.https(popapiurl, '/pop/referential/geolocations',
        {'searchText': searchText, 'pageNumber': page.toString()});
    var response = await http.get(url);

    if (response.statusCode == 200) {
      var jsonResponse = convert.jsonDecode(
              const convert.Utf8Decoder().convert(response.bodyBytes))
          as Map<String, dynamic>;
      jsonResponse['countries'].forEach((countries) {
        locations.add(PopLocation(
            countries['code'], countries['libelle'], LocationType.country));
      });
      jsonResponse['regions'].forEach((regions) {
        locations.add(
            PopLocation(regions['code'], regions['name'], LocationType.region));
      });
      jsonResponse['departments'].forEach((dept) {
        locations.add(PopLocation(
            dept['code'], dept['libelle'], LocationType.department));
      });
      jsonResponse['cities'].forEach((cities) {
        locations.add(
            PopLocation(cities['code'], cities['libelle'], LocationType.city));
      });
      jsonResponse['circonscriptions'].forEach((circonscription) {
        locations.add(PopLocation(circonscription['code'],
            circonscription['libelle'], LocationType.circonscription));
      });
      return locations;
    } else {
      throw PopServiceException("Unable to serve request.");
    }
  }

  Future<void> saveGeoLocation(List<PopLocation> selectedRegions) async {
    var url = Uri.https(popapiurl, '/pop/user/geochoices');
    var jwt = await authService.getCurrentUserAccessToken();
    var request = http.Request('POST', url);
    var headers = {
      HttpHeaders.authorizationHeader: 'Bearer $jwt',
      HttpHeaders.contentTypeHeader: 'application/json'
    };
    request.body = selectedRegions.toString();
    request.headers.addAll(headers);
    http.StreamedResponse response = await request.send();
    if (response.statusCode == 201) {
      return;
    } else {
      throw PopServiceException(
          'Unable to serve your request. Please try later');
    }
  }

  Future<void> saveInterest(List<PopInterest> interest) async {
    var url = Uri.https(popapiurl, '/pop/user/interets');
    var jwt = await authService.getCurrentUserAccessToken();
    var request = http.Request('POST', url);
    var headers = {
      HttpHeaders.authorizationHeader: 'Bearer $jwt',
      HttpHeaders.contentTypeHeader: 'application/json'
    };
    request.body = interest.toString();
    request.headers.addAll(headers);

    http.StreamedResponse response = await request.send();

    if (response.statusCode == 201) {
      return;
    } else {
      throw PopServiceException(
          'Unable to serve your request. Please try later');
    }
  }

  Future<void> saveQuestion(PopQuestionRequest question) async {
    var url = Uri.https(popapiurl, '/pop/questions');
    var jwt = await authService.getCurrentUserAccessToken();
    var request = http.Request('POST', url);
    var headers = {
      HttpHeaders.authorizationHeader: 'Bearer $jwt',
      HttpHeaders.contentTypeHeader: 'application/json'
    };
    request.body = question.toString();
    request.headers.addAll(headers);
    http.StreamedResponse response = await request.send();

    if (response.statusCode == 201) {
      return;
    } else {
      throw PopServiceException(
          'Unable to serve your request. Please try later');
    }
  }

  Future<List<PopQuestion>> listQuestion() async {
    var url = Uri.https(popapiurl, '/pop/user/question-feed');
    var jwt = await authService.getCurrentUserAccessToken();
    var response = await http
        .get(url, headers: {HttpHeaders.authorizationHeader: 'Bearer $jwt'});
    if (response.statusCode == 200) {
      var jsonResponse = convert.jsonDecode(
          const convert.Utf8Decoder().convert(response.bodyBytes)) as List;
      return List<PopQuestion>.from(
          jsonResponse.map((e) => PopQuestion.fromMap(e)));
    } else {
      throw PopServiceException("Unable to serve request.");
    }
  }

  Future<PopQuestionDetail> getQuestionStat(int id) async {
    var url = Uri.https(popapiurl, '/pop/questions/$id');
    var jwt = await authService.getCurrentUserAccessToken();
    var response = await http
        .get(url, headers: {HttpHeaders.authorizationHeader: 'Bearer $jwt'});
    if (response.statusCode == 200) {
      var jsonResponse = convert.jsonDecode(
              const convert.Utf8Decoder().convert(response.bodyBytes))
          as Map<String, dynamic>;

      return PopQuestionDetail.fromMap(jsonResponse);
    } else {
      throw PopServiceException("Unable to serve request.");
    }
  }

  Future<void> removeUserGeoLocation(PopLocation geochoice) async {
    var geoType = geochoice.locationType
        .toString()
        .replaceAll('LocationType.', '')
        .toUpperCase();
    // var url = Uri.https(
    //     popapiurl, '/pop/user/geochoices/${geochoice.id}?geoType=$geoType');

    final queryParameters = {'geoType': geoType};

    var url = Uri.http(
        popapiurl, '/pop/user/geochoices/${geochoice.id}', queryParameters);

    var jwt = await authService.getCurrentUserAccessToken();
    var request = http.Request('DELETE', url);
    var headers = {
      HttpHeaders.authorizationHeader: 'Bearer $jwt',
      HttpHeaders.contentTypeHeader: 'application/json'
    };
    // request.body = geochoice.toString();
    request.headers.addAll(headers);

    http.StreamedResponse response = await request.send();
    if (response.statusCode == 202) {
      return;
    } else {
      throw PopServiceException(
          'Unable to serve your request. Please try later');
    }
  }

  removeUserInterest(UserInterest interest) async {
    var url = Uri.https(popapiurl, '/pop/user/interets/${interest.code}');
    var jwt = await authService.getCurrentUserAccessToken();
    var request = http.Request('DELETE', url);
    var headers = {
      HttpHeaders.authorizationHeader: 'Bearer $jwt',
      HttpHeaders.contentTypeHeader: 'application/json'
    };
    // request.body = interest.toString();
    request.headers.addAll(headers);

    http.StreamedResponse response = await request.send();

    if (response.statusCode == 202) {
      return;
    } else {
      throw PopServiceException(
          'Unable to serve your request. Please try later');
    }
  }

  Future<void> addAnswerToQuestion(int questionId, String questionResp) async {
    var url = Uri.https(popapiurl, '/pop/questions/$questionId/answer');
    var jwt = await authService.getCurrentUserAccessToken();
    var request = http.Request('POST', url);
    var headers = {
      HttpHeaders.authorizationHeader: 'Bearer $jwt',
      HttpHeaders.contentTypeHeader: 'application/json'
    };
    request.body = '{"responseType": "$questionResp"}';
    request.headers.addAll(headers);
    http.StreamedResponse response = await request.send();
    if (response.statusCode == 202) {
      return;
    } else {
      throw PopServiceException(
          'Unable to serve your request. Please try later');
    }
  }

  Future<void> updateAnswerToQuestion(
      int questionId, String questionResp) async {
    var url = Uri.https(popapiurl, '/pop/questions/$questionId/answer');
    var jwt = await authService.getCurrentUserAccessToken();
    var request = http.Request('PUT', url);
    var headers = {
      HttpHeaders.authorizationHeader: 'Bearer $jwt',
      HttpHeaders.contentTypeHeader: 'application/json'
    };
    request.body = '{"responseType": "$questionResp"}';
    request.headers.addAll(headers);
    http.StreamedResponse response = await request.send();
    if (response.statusCode == 202) {
      return;
    } else {
      throw PopServiceException(
          'Unable to serve your request. Please try later');
    }
  }

  Future<List<PopQuestion>> getUserAuthoredQuestions() async {
    var url = Uri.https(popapiurl, '/pop/user/questions');
    var jwt = await authService.getCurrentUserAccessToken();
    var response = await http
        .get(url, headers: {HttpHeaders.authorizationHeader: 'Bearer $jwt'});
    if (response.statusCode == 200) {
      var jsonResponse = convert.jsonDecode(
          const convert.Utf8Decoder().convert(response.bodyBytes)) as List;
      return List<PopQuestion>.from(
          jsonResponse.map((e) => PopQuestion.fromMap(e)));
    } else {
      throw PopServiceException("Unable to serve request.");
    }
  }

  Future<List<PopAnsweredQuestion>> getUserAnsweredQuestions() async {
    var url = Uri.https(popapiurl, '/pop/user/answers');
    var jwt = await authService.getCurrentUserAccessToken();

    var response = await http
        .get(url, headers: {HttpHeaders.authorizationHeader: 'Bearer $jwt'});
    if (response.statusCode == 200) {
      var jsonResponse = convert.jsonDecode(
          const convert.Utf8Decoder().convert(response.bodyBytes)) as List;
      return List<PopAnsweredQuestion>.from(
          jsonResponse.map((e) => PopAnsweredQuestion.fromMap(e)));
    } else {
      throw PopServiceException("Unable to serve request.");
    }
  }

  Future<void> changePassword(String newPassword) async {
    var url = Uri.https(popapiurl, '/pop/user/password');
    var jwt = await authService.getCurrentUserAccessToken();
    //var request = http.Request('PUT', url);
    var headers = {
      HttpHeaders.authorizationHeader: 'Bearer $jwt',
      HttpHeaders.contentTypeHeader: 'application/json'
    };
    final response = await http.put(
      url,
      headers: headers,
      body: convert.jsonEncode(<String, String>{'password': newPassword}),
    );

    if (response.statusCode == 200) {
      return;
    } else {
      throw PopServiceException(
          'Unable to serve your request. Please try later');
    }
  }
}
