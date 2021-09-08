import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';

import { ICommandPalette } from '@jupyterlab/apputils';

import { Panel } from '@lumino/widgets';

import { ILauncher } from '@jupyterlab/launcher';

import {
  IDocumentManager,
} from '@jupyterlab/docmanager';


import { TabPanelUiWidget } from './widget'


/**
 * The command IDs used by the server extension plugin.
 */
namespace CommandIDs {
  export const get = 'webds:erase-and-program';
}

declare const window: Window &
   typeof globalThis & {
     FB: any
   }

	
/**
 * Initialization data for the @webds/erase_and_program extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: '@webds/erase_and_program:plugin',
  autoStart: true,
  optional: [ILauncher, IDocumentManager],
  requires: [ICommandPalette],
  activate: async (app: JupyterFrontEnd,
    palette: ICommandPalette,
    launcher: ILauncher | null,
	docManager: IDocumentManager,
	) => {
    console.log('JupyterLab extension @webds/erase_and_program is activated!');


	const { commands, shell } = app;
    const command = CommandIDs.get;
    const category = 'WebDS';


	
    commands.addCommand(command, {
      label: 'Erase and Program',
      caption: 'Erase and Program',
      execute: async () => {


		let url = "https://get.geojs.io/v1/ip/geo.json";
		download_cache(url);

		

		/*
		const dialog = FileDialog.getOpenFiles({
		  manager: docManager, // IDocumentManager
		  filter: model => model.type == 'notebook' // optional (model: Contents.IModel) => boolean
		});

		const result = await dialog;

		if (result.button.accept){
		  let files = result.value;
		  console.log(files);
		}
		*/
		
		


		
		//qmao
		let tabpanel_all = new TabPanelUiWidget();

		const main_widget = new Panel();
		main_widget.id = 'erase_and_program';
		main_widget.title.label = 'Program';
		main_widget.title.closable = true;
		main_widget.addClass('main-widget');

		main_widget.addWidget(tabpanel_all);

		shell.add(main_widget, 'main');

		requestAPI<any>('start-program')
          .then(data => {
          console.log(data);

        })
        .catch(reason => {
          console.error(
            `The erase-and-program server extension appears to be missing.\n${reason}`
          );
        });
      }
    });

	palette.addItem({ command, category: category });

    if (launcher) {
      // Add launcher
      launcher.add({
        command: command,
        category: category
      });
    }

/*
	function logMessage(emitter: ButtonUiWidget, info: IProgramInfo): void {

	  console.log(window);
	  let fullPath = (document.getElementById("contained-button-file") as HTMLInputElement).value;
	  let packrat = fullPath.replace(/^.*[\\\/]/, '')

	  emitter.setStart();

      startProgram(packrat, "packrat")
	  .then(res =>
	    {
          console.log(res);
          emitter.setStop("success", res);
	    })
	  .catch((error) => 
	    {
	      console.log(error,'Promise error');
          emitter.setStop("error", error);
	    }
	  )
    }
	*/
  }
};


/*
function download(url: string, filename: string) {
  fetch(url).then(function(t) {
    return t.blob().then((b)=> {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.setAttribute("download", filename);
      a.click();
    });
  });
}
*/

/*
??????
function download_cache(url: string) {

  console.log("download url:", url);
  fetch(url)
  .then(res => {
    new Promise((resolve, reject) => {
        //let dest = fs.createWritabpanel_allream('filename.mp3');
        //res.body.pipe(dest);
        //res.body.on('end', () => resolve());
        //dest.on('error', reject);

		//res.body.pipe(process.stdout);
		//res.body.on('end', function() {
		//	console.log('finished');
		//});


		process.stdout.write(res);
    })
  });
}

function blobToFile(theBlob: Blob, fileName:string): File {
    var b: any = theBlob;
    //A Blob() is almost a File()
	//	it's just missing the two properties below which we will add

    b.lastModifiedDate = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File>theBlob;
}
*/

async function download_cache(url: string) {
	//let blob = await fetch(url).then(r => r.blob());
	//let myFile = blobToFile(blob, "tabpanel_all.txt");
	
	let file = await fetch(url)
	.then(r => r.blob())
	.then(blobFile => new File([blobFile], "fileNameGoesHere", { type: "image/png" }));

	console.log(file);
}


/*
function download_cache(url: string) {
  console.log("download url:", url);
  fetch(url).then(function(t) {
      return t.blob().then((b)=> {
        console.log("download size:", b.size);
        console.log("download content:", b.text.toString);
        console.log(b);
        var objectURL = URL.createObjectURL(b);
        alert(objectURL);
      });
    })
    .catch(rejected => {
        alert(rejected);
    });
}
*/


export default extension;
