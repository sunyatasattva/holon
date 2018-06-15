require('dotenv').config()

var FtpDeploy = require('ftp-deploy');
var ftpDeploy = new FtpDeploy();
var sourceRoot,
    destinationRoot;

if(process.argv[2] === 'app') {
  sourceRoot = __dirname + '/dist/';
  destinationRoot = 'holon/app/dist';
} else if(process.argv[2] === 'rulebook') {
  sourceRoot = __dirname + '/rulebook/dist/';
  destinationRoot = 'holon/rulebook/dist';
} else {
  console.log(process.argv);
  throw new Error('Must provide valid deploy argument.');
}

 
var config = {
  user: process.env.FTP_USERNAME,
  password: process.env.FTP_PASS,
  host: process.env.FTP_HOST,
  port: 21,
  localRoot: sourceRoot,
  remoteRoot: destinationRoot,
  include: ['*'],
  exclude: [],
  deleteRoot: true
}
 
// use with promises
ftpDeploy.deploy(config)
  .then( res => console.log('Finished uploading ' + process.argv[1]) )
  .catch( err => console.log(err) )
    