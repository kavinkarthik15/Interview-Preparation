const mongoose = require('mongoose');

const mockInterviewAnswerSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
    },
    suggestion: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MockInterviewAnswer', mockInterviewAnswerSchema);
