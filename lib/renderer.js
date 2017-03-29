const electron = require('electron');
const ipc = electron.ipcRenderer;
const $ = require('jquery');
const marked = require('marked');
const remote = electron.remote;
const mainProcess = remote.require('./main');
const clipboard = remote.clipboard;
const shell = electron.shell;

const currentWindow = remote.getCurrentWindow();

const {
  createWindow,
  openFile,
  saveFile } = remote.require('./main');

const $markdownView = $('.raw-markdown');
const $htmlView = $('.rendered-html');
const $openFileButton = $('#open-file');
const $newFileButton = $('#new-file');
const $saveFileButton = $('#save-file');
const $copyHtmlButton = $('#copy-html');
const $showInFileSystemButton = $('#show-in-file-system');
const $openInDefaultEditorButton = $('#open-in-default-editor');

let currentFile = null;

ipc.on('file-opened', (event, file, content) => {
  currentFile = file;
  $showInFileSystemButton.attr('disabled', false);
  $openInDefaultEditorButton.attr('disabled', false);

  $markdownView.text(content);
  renderMarkdownToHtml(content);
});

$markdownView.on('keyup', () => {
  const content = $markdownView.val();
  renderMarkdownToHtml(content);
  if (content.length > 0) {
    currentWindow.setDocumentEdited(true);
  }
});

$(document).on('click', 'a[href^="http"]', function (event) {
  event.preventDefault();
  shell.openExternal(this.href);
});

const renderMarkdownToHtml = (md) => {
  var html = marked(md);
  $htmlView.html(html);
};

$openFileButton.on('click', () => {
  mainProcess.openFile();
});

$copyHtmlButton.on('click', () => {
  var html = $htmlView.html();
  clipboard.writeText(html);
});

$saveFileButton.on('click', () => {
  let html = $htmlView.html();
  mainProcess.saveFile(html);
});

$showInFileSystemButton.on('click', () => {
	shell.showItemInFolder(currentFile);
});

$openInDefaultEditorButton.on('click', () => {
	shell.openItem(currentFile);
});

$newFileButton.on('click', () => {
  createWindow();
});

$openFileButton.on('click', () => {
  openFile(currentWindow);
});

$saveFileButton.on('click', () => {
  var html = $htmlView.html();
  saveFile(currentWindow, html);
});
