// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

const { contextBridge } = require('electron')
const {spawn, exec, execFile } = require('child_process')
const path = require('path')

contextBridge.exposeInMainWorld('myAPI', {
  startServerForSpawn: () => {
    let path1 = path.join(__dirname, 'app/ruoyi-admin.jar');
    const ls = spawn('java', ['-jar', path1]);
    ls.stdout.on('data', (data) => {
      if(data.toString().indexOf("Started RuoYiApplication") !== -1){
        window.location.href="http://localhost:80";
      }
    });
    ls.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      alert("启动服务异常");
    });
    ls.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
    });
  },
  startServerForSpawnBat: () =>{
    const bat = spawn(path.join(__dirname, 'my.bat'));
    bat.stdout.on('data', (data) => {
      console.log(data.toString());
      if(data.toString().indexOf("Started RuoYiApplication") !== -1){
        window.location.href="http://localhost:80";
      }
    });
    bat.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    bat.on('exit', (code) => {
      console.log(`Child exited with code ${code}`);
    });
  },
  startServerForExec: () =>{
    let path1 = path.join(__dirname, 'app/ruoyi-admin.jar');
    let path2 = path.join(__dirname, 'jre/bin');
    let command = 'cd ' + path2 + ' && java -jar ' + path1; // 打成asar访问不到
    // command = 'cd jre/bin && java -jar ../../app/ruoyi-admin.jar'; // 打成asar访问不到
    const subprocess = exec(command, (err, stdout, stderr) => { // 回调函数只在进程终止时才会执行
        if (err) {
          console.error(err);
          return;
        }
        console.log("---");
        console.log(stdout);
        console.log(stderr);
    });
    subprocess.stdout.on('data', (data) => {
      console.log(`Received chunk ${data}`);
      if (data.toString().indexOf("Started RuoYiApplication") !== -1){
        console.log(subprocess.killed);
        subprocess.kill();
        console.log(subprocess.killed);
        window.location.href="http://localhost:80";
      }
    });

 },
  startServerForExceFile: () =>{ // 回调函数只在进程终止时才会执行
    let path1 = path.join(__dirname, 'my.bat')
    const subprocess = execFile(path1,(err, stdout, stderr) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("------------");
      console.log(stdout);
      console.log(stderr);
    });
    subprocess.stdout.on('data', (data) => {
      console.log(`Received chunk ${data}`);
      if (data.toString().indexOf("Started RuoYiApplication") !== -1){
        console.log(subprocess.killed);
        subprocess.kill();
        console.log(subprocess.killed);
       window.location.href="http://localhost:80";
      }
    });
  }
})