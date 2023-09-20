// A pipe is a program/script with its input and output. A sequence of pipes
// make up a pipeline.
import * as storage from "./storage.js";
import * as tips from "./tips.js";
const defaultData = 
  {
    program: `io_input
`,
    input: ``,
    output: '',
    lang: "*.py",
  };

async function getPipe(prevID, id) {
  let data = await storage.getData(id);
  if (!data) {
    data = {};
    data.program = defaultData.program;
    data.input = defaultData.input;
    data.output = defaultData.output;
    data.lang = defaultData.lang;
    data.files = [];
    storage.setData(id, data);
  }
  const rangeIterator = {
    program: function() {
      return data.program;
    },
    doc: function() {
      return storage.getDoc(id);
    },
    input: async function() {
      if (!prevID) {
        return data.input;
      }
      let o = await storage.getData(prevID);
      return o.output;
    },
    output: function() {
      return data.output;
    },
    lang: function() {
      return data.lang;
    },
    files: function() {
      return data.files ? data.files : [];
    },
    data: function() {
      return data;
    },
    id: function() {
      return id;
    },
    prevID: function() {
      return prevID;
    },
    addFile: async function(f) {
      if (!data.files) {
        data.files = [f];
      } else {
        data.files.push(f);
      }
      storage.setMetadata(id, { files: data.files, lang: data.lang });
    },
    delete: async function(p) {
      storage.deleteData(id, data.files);
    },
    updateLang: async function(p) {
      data.lang = p;
      storage.setMetadata(id, { files: data.files, lang: data.lang });
    },
    updateProgram: async function(p, doc) {
      data.program = p;
      storage.setProgram(id, data.program, doc);
    },
    updateInput: async function(p) {
      data.input = p;
      storage.setInput(id, data.input);
    },
    updateOutput: async function(p) {
      data.output = p;
      storage.setOutput(id, data.output);
    },
  };
  return rangeIterator;
}
export { getPipe };
