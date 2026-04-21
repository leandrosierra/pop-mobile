class PopAnsweredQuestion {
  int id;
  String questionTitle;
  String questionDescription;
  String creator;
  String response;

  PopAnsweredQuestion(this.id, this.questionTitle, this.questionDescription,
      this.creator, this.response);

  static PopAnsweredQuestion fromMap(Map value) {
    PopAnsweredQuestion answeredQuestion = PopAnsweredQuestion(
        value['id'],
        value['questionTitle'],
        value['questionDescription'],
        value['creator'],
        value['response']);
    return answeredQuestion;
  }
}
