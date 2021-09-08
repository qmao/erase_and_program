import React, { useState, useContext } from 'react';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import { requestAPI } from './handler';
import { UserContext } from './context';

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

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        progress_program: {
            width: '100%',
            '& > * + *': {
                marginTop: theme.spacing(2),
            },
        },
    }),
);

function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function ButtonUi(props: ButtonProps) {
    const { children, value, index, title, alert, ...other } = props;
    const [isAlert, setAlert] = useState(false);
    const [progress, setProgress] = useState(false);
    const [message, setMessage] = useState("");
    const [disable, setDisable] = useState(false);
    
    const context = useContext(UserContext);
    const classes = useStyles();

    let severity: any = undefined;


    const onClick = (event?: React.SyntheticEvent, reason?: string) => {
        console.log("context packrat", context.packrat);

        setDisable(true);

        if (context.packrat == "") {
            show_result(false, "Please choose a HEX file");
        } else {
            setProgress(true);

            setAlert(false);
            start_program()
                .then(res => {
                    console.log(res);

                    show_result(true, res || '');
                    setProgress(false);
                    setDisable(false);
                })
                .catch((error) => {
                    console.log(error, 'Promise error');
                    show_result(false, error);
                    setProgress(false);
                    setDisable(false);
                })
        }
    };

    const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setAlert(false);
    };
    const show_result = (pass: boolean, message: string) => {
        if (pass)
            severity = "success";
        else
            severity = "error";
        setMessage(message);
        setAlert(true);

        console.log(pass);
    }

    const start_program = async (): Promise<string | undefined> => {
        let reply_str = "";
        const file_type = "hex";
        const file_name = context.packrat;
        const dataToSend = { filename: file_name, type: file_type };

        console.log("test filename:", file_name);

        try {
            const reply = await requestAPI<any>('start-program', {
                body: JSON.stringify(dataToSend),
                method: 'POST',
            });
            console.log(reply);
            reply_str = JSON.stringify(reply);

        } catch (e) {
            console.error(
                `Error on POST ${dataToSend}.\n${e}`
            );
            return Promise.reject((e as Error).message);
        }
        return Promise.resolve(reply_str);
    }

    return (
        <div {...other}>
            <div className={classes.progress_program}>
                { progress && <LinearProgress /> }
            </div>
            <Button variant="outlined" color="primary" href="#outlined-buttons" onClick={onClick} disabled={disable}>
	            {title}
            </Button>
            <Snackbar open={isAlert} autoHideDuration={3000} onClose={handleClose}>
                <Alert severity={severity}>
                    { message }
                </Alert>
            </Snackbar>
        </div>
    );
}


