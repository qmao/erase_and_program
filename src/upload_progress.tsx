import { ReactWidget } from '@jupyterlab/apputils';

import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
//import { mostUsedIcon } from './icons';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            display: 'flex',
            '& > * + *': {
                marginLeft: theme.spacing(2),
            },
        },
    }),
);

export default function UploadProgressReact() {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <CircularProgress id="progress"/>
        </div>
    );
}

export class UploadProgress extends ReactWidget {
    /**
     * Constructs a new CounterWidget.
     */
    constructor() {
        super();
    }

    render(): JSX.Element {
        return <UploadProgressReact/>;
    }
}