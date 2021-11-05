import React, { useState, useContext, useEffect } from 'react';
import { requestAPI } from './handler';
import { UserContext } from './context';

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';

import Fab from '@mui/material/Fab';

import { w3cwebsocket as W3CWebSocket } from "websocket";

export interface IProgramInfo {
    filename: string;
    type: string
}

interface ButtonProps {
    children?: React.ReactNode;
    index?: any;
    value?: any;
    title?: any;
    alert?: any;
    onClick?: any;
    onFinish?: any;
}


export default function ButtonProgram(props: ButtonProps) {
    const { children, value, index, title, alert, ...other } = props;
    const [message, setMessage] = useState("");
    const [isAlert, setAlert] = useState(false);
    const [disable, setDisable] = useState(false);
    const [severity, setSeverity] = useState<'error' | 'info' | 'success' | 'warning'>('info');
    const [result, setResult] = useState("");
    const [progress, setProgress] = React.useState(0);
    const [buffer, setBuffer] = React.useState(0);
    const [isStart, setStart] = React.useState(false);

    const context = useContext(UserContext);

    interface ProgramResponse {
        status: string;
        message: string;
    }

    /*
    interface ProgressResponse {
        status: string;
        progress: number;
    }
    */

    useEffect(() => {
        console.log("start is set");

        if (isStart) {
            setProgramStatus(true);

            if (context.packrat.includes("PR")) {
                console.log("packrat is exising");
            }
            else {
                console.log("need to download packrat from server");
                start_fetch();
            }

            if (context.packrat == "") {
                setProgramStatus(false, false, "Please choose a HEX file");
            }
            else {
                start_program()
                    .then(res => {
                        console.log(res);
                        setProgramStatus(false, res!.status == 'success', res!.message);
                    })
                    .catch((error) => {
                        console.log(error, 'Promise error');
                        setProgramStatus(false, false, error);
                    })
            }
        }
    }, [isStart]);

    useEffect(() => {
        console.log("buffer:", buffer);
        console.log("progress:", progress);
    }, [progress, buffer]);

    /*
    async function poll(ms: number) {
        while (true) {
            console.log("start poll:");
            let post_progress = 0;
            setBuffer(post_progress + 3);

            const res: ProgressResponse = await requestAPI<any>('program');
            console.log(res);

            console.log("progress::::", res);
            setProgress(res!.progress);
            post_progress = res!.progress;
            console.log("progress 1:", res!.progress);

            if (res!.progress == 100)
                break;

            console.log("progress: 2");
            await new Promise(f => setTimeout(f, ms));
            console.log("progress: 3");
        }
    }
    */

    const setProgramStatus = (start: boolean, status?: boolean, result?: string) => {

        if (start) {
            setAlert(false);
            //poll(500);
        }
        else {
            console.log(result);
            show_result(status!, result || '');
            setStart(false);
        }

        setBuffer(0);
        setProgress(0);

        setDisable(start);
    }

    const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setAlert(false);
    };
    const show_result = (pass: boolean, message: string) => {
        console.log("pass:", pass);
        if (pass) {
            setSeverity('success');
            setResult("Success");
        }
        else {
            setSeverity('error');
            setResult("Error");
        }
        setMessage(message);
        setAlert(true);

        console.log(pass);
    }

    const start_program = async (): Promise<ProgramResponse | undefined> => {
        const file_type = "hex";
        const file_name = context.packrat;
        const action = "start";
        const dataToSend = {
            filename: file_name,
            type: file_type,
            action: action
        };

        console.log("filename:", file_name);

        try {

            console.log('I want test websocket!!!');

            let client = new W3CWebSocket('ws://pi-syna.local:8889/echo');
            console.log(client.readyState)

            for (let i = 0; i < 10; i++) {
                console.log(client.readyState)
                if (client.readyState) {
                    console.log("send message!!!")

                    let pong: any = { Type: "Pong" };
                    client.send(JSON.stringify(pong));

                    //client.send("message")
                    break;
                }
                new Promise(f => setTimeout(f, 1000));
            }

            client.send("message")

            //client.onmessage = event => {
            //    console.log(event)
            //}

            new Promise(f => setTimeout(f, 10000));

            console.log('I want test request after websocket!!!');









            const reply = await requestAPI<any>('program', {
                body: JSON.stringify(dataToSend),
                method: 'POST',
            });
            console.log(reply);
            return Promise.resolve(reply);
        } catch (e) {
            console.error(
                `Error on POST ${dataToSend}.\n${e}`
            );
            return Promise.reject((e as Error).message);
        }
    }

    const start_fetch = async (): Promise<string | undefined> => {
        try {
            console.log("start to fetch");

            var myRequest = new Request('https://get.geojs.io/v1/ip/geo.json');

            fetch(myRequest)
                .then(response => response.blob())
                .then(function (myBlob) {
                    const formData = new FormData();
                    formData.append("blob", myBlob, 'test');

                    requestAPI<any>('upload', {
                        body: formData,
                        method: 'POST',
                    });
                });


            /*
            fetch('https://get.geojs.io/v1/ip/geo.json')
                .then(response => {
                    console.log(response);
                    if (!response.ok) {
                        throw new Error("HTTP error " + response.status);
                    }
                    return response.json();
                })
                .then(json => {
                    console.log(json);
                })
                .catch(function () {
                    console.log("error!!!");
                })
                */
            return Promise.reject(message);
        } catch (e) {
            return Promise.reject((e as Error).message);
        }
    }

    return (
        <div {...other}>
            <Box sx={{ width: '100%', maxWidth: 490 }}>
                {disable && (
                    <LinearProgress variant="buffer" value={progress} valueBuffer={buffer} />
                )}
            </Box>
            <Box sx={{
                m: 1, display: 'flex',
                flexDirection: 'row-reverse'
                    }}
            >
                <Fab variant="extended" color="primary" disabled={disable} onClick={() => setStart(true)} sx={{ maxWidth: 145, mr: 12 }}>
                    <FlashOnIcon sx={{ mr: 1 }} />
                    {title}
                </Fab>

                {disable && (
                    <CircularProgress
                        size={36}
                        sx={{
                            color: "primary",
                            position: 'absolute',
                            mr: '190px',
                            marginTop: '6px',
                        }}
                    />
                )}
            </Box>

            <Snackbar open={isAlert} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} >
                <Alert severity={severity} onClose={handleClose}>
                    <AlertTitle> {result} </AlertTitle>
                    {message}
                </Alert>
            </Snackbar>
        </div>
    );
}


