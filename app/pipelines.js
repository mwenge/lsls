import { pipelineNames } from './pipelinenames.js';
import { getPipeline } from "./pipeline.js";
import { examplePipelines, exampleFiles } from "./example.js";
import { updatePipelineOnAwesomeBar, quickPipeDisplayUpdate } from "./awesomebar-pipeline.js";

export async function updateAwesomeBar(i = 0) {
  updatePipelineOnAwesomeBar(pipeline.currentPipeline(),
    pipeline.currentPipeIndex(),
    pipelinePrettyNames[currentPipelineIndex],
    await pipeline.getFilesForCurrentPipe(),
		currentPipelineIndex); 
  fillPreviousSteps();
}

async function fillPreviousSteps() {
  let ci = pipeline.currentPipeIndex();
  for (let i = 0; i < 5; i++) {
    let pipe = await pipeline.getPreviousPipe(ci);
    let o = "", p = "";
    if (pipe) {
      o = pipe.output();
      p = pipe.program();
    }
    results[i].updateContent(o);
    commands[i].updateContent(p);
    ci--;
  }
}
// Helper functions to navigate pipes and pipelines.
export async function updateDisplayedPipe(pipe) {
  if (!pipe) { return; }
  // Swap in the cached document for this pipe.
  let doc = pipe.doc();
  if (!doc) {
    doc = CodeMirror.Doc(pipe.program(), Object);
  }
  editor.swapDoc(doc);
  editor.setOption("mode", cmLangs[pipe.lang()].syntax);
  outputWrapper.updateContent(pipe.output());
  updateAwesomeBar();
  inputWrapper.updateContent(await pipe.input(), pipeline.currentPipeIndex() == 0);
  localStorage.setItem("checkpoint", JSON.stringify({
    currentPipelineIndex: currentPipelineIndex,
    initialIndex: pipeline.currentPipeIndex()
  }));
}

export async function insertBefore() {
  pipeline.currentPipe().updateProgram(editor.getValue(), editor.getDoc());
  let pipe = await pipeline.insertBefore();
  updateDisplayedPipe(pipe);
}

export async function deleteCurrent() {
  let pipe = await pipeline.deleteCurrent();
  updateDisplayedPipe(pipe);
}

export async function nextPipeOrInsertAfter() {
  if (pipeline.atEndOfPipeline()) {
    insertAfter();
    return;
  }
  nextPipe();
}

export async function insertAfter() {
  pipeline.currentPipe().updateProgram(editor.getValue(), editor.getDoc());
  let pipe = await pipeline.insertAfter();
  updateDisplayedPipe(pipe);
}

export async function previousPipe() {
  quickPipeDisplayUpdate(pipeline.currentPipeIndex(), -1);
  await setTimeout(async ()=> { 
    pipeline.currentPipe().updateProgram(editor.getValue(), editor.getDoc());
    let pipe = await pipeline.moveToPreviousPipe();
    updateDisplayedPipe(pipe);
  }, 10);
}

export async function moveToFirstPipe() {
  pipeline.currentPipe().updateProgram(editor.getValue(), editor.getDoc());
  let pipe = await pipeline.moveToFirstPipe();
  updateDisplayedPipe(pipe);
  return pipe;
}

export async function nextPipe() {
  function nextPipeImpl() {
    var promise = new Promise(function(resolve, reject) {
      setTimeout(async function() {
        if (!pipeline.currentPipeIndex())
          pipeline.currentPipe().updateInput(inputWrapper.getValue());
        pipeline.currentPipe().updateProgram(editor.getValue(), editor.getDoc());
        let pipe = await pipeline.moveToNextPipe();
        updateDisplayedPipe(pipe);
        resolve(pipe);
      });
    });
    return promise;
  }
  quickPipeDisplayUpdate(pipeline.currentPipeIndex(), 1);
  async function getNextPipe() {
    let pipe = await nextPipeImpl();
    return pipe
  }
  return await getNextPipe();
}

export async function nextPipeline() {
  function getNewName(c) {
    let i = 0;
    while (true) {
      if (c >= pipelineNames.length) {
        c = 0;
        i++;
      }
      let name = pipelineNames[c++] + (i ? (" " + i) : "");
      if (!pipelines.includes(name)) return name;
    }
  }

  // Store the current pipe before moving away from it.
  if (!pipeline.currentPipeIndex())
    pipeline.currentPipe().updateInput(inputWrapper.getValue());
  pipeline.currentPipe().updateProgram(editor.getValue(), editor.getDoc());

  // The pipeline already exist, so display it.
  if (currentPipelineIndex < pipelines.length - 1) {
    currentPipelineIndex++;
    pipeline = await getPipeline(pipelines[currentPipelineIndex]);
    updateDisplayedPipe(pipeline.currentPipe());
    return;
  }

  // We have to create the pipeline.
  let cur = pipelines.length;
  let newPipelineName = getNewName(cur);
  await addPipeline(newPipelineName);
}

export async function addPipeline(newPipelineName) {
  pipelines.push(newPipelineName);
  pipelinePrettyNames.push(newPipelineName);
  currentPipelineIndex = pipelines.length - 1;
  localStorage.setItem("pipelines", JSON.stringify(pipelines));
  localStorage.setItem("pipelinePrettyNames", JSON.stringify(pipelinePrettyNames));
  pipeline = await getPipeline(pipelines[currentPipelineIndex]);
  updateDisplayedPipe(pipeline.currentPipe());
}

export async function prevPipeline() {
  if (!pipeline.currentPipeIndex())
    pipeline.currentPipe().updateInput(inputWrapper.getValue());
  pipeline.currentPipe().updateProgram(editor.getValue(), editor.getDoc());
  if (!currentPipelineIndex) {
    return;
  }
  currentPipelineIndex--;
  pipeline = await getPipeline(pipelines[currentPipelineIndex]);
  updateDisplayedPipe(pipeline.currentPipe());
}

export async function deletePipeline() {
  if (!currentPipelineIndex) return;

  // Delete the storage for each pipe.
  let curPipe = -1;
  let pipe = await pipeline.getNextPipe(curPipe);
  while (pipe) {
    pipe.delete();
    pipe = await pipeline.getNextPipe(++curPipe);
  }

  // Delete the current pipeline.
  localStorage.removeItem(pipelines[currentPipelineIndex]);
  pipelines.splice(currentPipelineIndex, 1);
  pipelinePrettyNames.splice(currentPipelineIndex, 1);
  localStorage.setItem("pipelines", JSON.stringify(pipelines));
  localStorage.setItem("pipelinePrettyNames", JSON.stringify(pipelinePrettyNames));

  // Move to the previous pipe.
  if (currentPipelineIndex) currentPipelineIndex--;
  pipeline = await getPipeline(pipelines[currentPipelineIndex]);
  updateDisplayedPipe(pipeline.currentPipe());
}

export function openFile() {
  const fileUpload = document.getElementById('file-upload');
  fileUpload.click();
}

var enc = new TextEncoder(); // always utf-8
// Initialize the example pipeline if necessary.
let savedPipelines = localStorage.getItem("pipelines");
if (!savedPipelines) {
  let names = examplePipelines.map(x => x.name);
  localStorage.setItem("pipelines", JSON.stringify(names));
  localStorage.setItem("pipelinePrettyNames", JSON.stringify(names));
  for (var examplePipeline of examplePipelines) {
    await Promise.all(examplePipeline.pipeline.map(async (p) => {
      await localforage.setItem(p.key+"-input", p.input);
      await localforage.setItem(p.key+"-program", p.program);
      await localforage.setItem(p.key+"-output", p.output);
      await localforage.setItem(p.key+"-metadata", { files: p.files, lang: p.lang });
    }));
    let newPipeline = [];
    examplePipeline.pipeline.forEach(p => {
      newPipeline.push({pid: p.key, lang: p.lang});
    });
    localStorage.setItem(examplePipeline.name, JSON.stringify(newPipeline));
  }
  // Add the example files.
  for (var file of exampleFiles) {
    await localforage.setItem(file.name, enc.encode(file.data).buffer);
  }
  localStorage.setItem("checkpoint", JSON.stringify({ currentPipelineIndex: 0, initialIndex: 0 }));
}

// Initialize the main pipeline data.
export let { currentPipelineIndex, initialIndex } = JSON.parse(localStorage.getItem("checkpoint"));
export let pipelines = JSON.parse(localStorage.pipelines);
let pipelinePrettyNames = JSON.parse(localStorage.pipelinePrettyNames);
export let pipeline = await getPipeline(pipelines[currentPipelineIndex], initialIndex);

// Set up the editor and input and output panes.
let editor = null;
let inputWrapper = null;
let outputWrapper = null;
let cmLangs = null;
let results = null;
let commands = null;
export function setPanes(e, i, o, langs, r, c) {
  editor = e;
  inputWrapper = i;
  outputWrapper = o;
  cmLangs = langs;
  results = r;
  commands = c;
  // Update the awesome bar.
  updateAwesomeBar();
}

export function pipelinePrettyName() {
  return pipelinePrettyNames[currentPipelineIndex];
}

// Handle changes to the current pipeline's pretty name.
function updatePipelinePrettyName(name) {
  pipelinePrettyNames[currentPipelineIndex] = name;
  localStorage.setItem("pipelinePrettyNames", JSON.stringify(pipelinePrettyNames));
  updateAwesomeBar();
};

document.getElementById("pipeline-name").addEventListener('keydown', (event) => {
  const keyName = event.key;
  if (keyName == 'Enter') {
    event.preventDefault();
    event.stopPropagation();
    updatePipelinePrettyName(event.target.textContent);
    event.target.blur();
  }
});

