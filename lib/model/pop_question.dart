class PopQuestion {
  int id;
  String questionTitle;
  String creator;
  String questionDesc;
  String status;

  PopQuestion(this.id, this.questionTitle, this.creator, this.questionDesc,
      this.status);

  static fromMap(Map value) {
    PopQuestion question = PopQuestion(value['id'], value['questionTitle'],
        value['creator'], value['questionDesc'], value['status']);
    return question;
  }
}
