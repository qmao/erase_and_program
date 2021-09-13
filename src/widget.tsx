import { ReactWidget } from '@jupyterlab/apputils';

import React, { useEffect } from 'react';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import UploadButtons from './upload'
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import FileList from './filelist'
import { requestAPI } from './handler';
import ButtonProgram from './program'
import Paper from '@material-ui/core/Paper';
import { UserContext } from './context';

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: any) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  progress: {
    display: 'flex',
        '& > * + *': {
            marginLeft: theme.spacing(2),
      },
    },
   text: {
        '& > *': {
            margin: theme.spacing(1),
            width: '25ch',
        },
    },
    program: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
    paper_tab: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
    },
    paper_program: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        display: 'flex',
        justifyContent: 'center'
    },
}));

export default function VerticalTabs(
    props: {
        onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    }
) {
    const classes = useStyles();
    const [value, setValue] = React.useState(0);
    const [filelist, setFileList] = React.useState([""]);
    const [loading, setLoading] = React.useState(false);
    const [packrat, setPackrat] = React.useState("");

    useEffect(() => {
        if (value == 0)
            get_hex_list();
    }, [value]);

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue);
    };

    const upload_hex = async (file: File): Promise<string | undefined> => {
        console.log("upload_hex:", event);

        if (file) {
            const formData = new FormData();
            formData.append("fileToUpload", file);
            let filename = file.name;
            console.log(formData);
            try {
                const reply = await requestAPI<any>('upload', {
                    body: formData,
                    method: 'POST',
                });
                
                console.log(reply);
                setLoading(false);
                setFileList(reply);

                // set select packrat
                console.log(reply);

                reply.forEach((element: any) => {
                    if (element.includes(filename)) {
                        console.log("include test: ", element);
                        setPackrat(element);
                    }
                });

                return reply;
            } catch (error) {
                if (error) {
                    return error.message
                }
            }
            setLoading(false);
        }
    }

    const get_hex_list = async (): Promise<string | undefined> => {
        console.log("get_hex_list:", event);
        const dataToSend = { action:"get-list", extension: "hex" };
        try {
            const reply = await requestAPI<any>('manage-file', {
                body: JSON.stringify(dataToSend),
                method: 'POST',
            });
            console.log(reply);
            setFileList(reply);
            return reply;
        } catch (error) {
            if (error) {
                return error.message
            }
        }
    }

    const delete_hex = async (filename: string): Promise<string | undefined> => {
        console.log("delete_hex:", event);
        const dataToSend = { action: "delete", extension: "hex", file: filename };
        try {
            const reply = await requestAPI<any>('manage-file', {
                body: JSON.stringify(dataToSend),
                method: 'POST',
            });
            console.log(reply);
            setFileList(reply);
            return reply;
        } catch (error) {
            if (error) {
                return error.message
            }
        }
    }

    const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log("onFileChange:", event.currentTarget.files);

        if (event.currentTarget.files) {
            props.onFileChange(event);      //???
            setLoading(true);
            upload_hex(event.currentTarget.files[0]);
        }
    };

    const onFileDelete = (file: string, index: number) => {
        console.log("onFileDelete:", file);
        delete_hex(file);
    };

    const onFileSelect = (file: string) => {
        console.log("onFileSelect:", file);
        setPackrat(file);
    };

    return (
        <UserContext.Provider
            value={{ packrat: packrat }}
        >
        <div className={classes.root}>
            <Paper className={classes.paper_tab}>
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={value}
                    onChange={handleChange}
                    aria-label="Vertical tabs example"
                    className={classes.tabs}
                    id="tabs"
                >
                    <Tab label="Cache" {...a11yProps(0)} />
                    <Tab label="Packrat" {...a11yProps(1)} />
                </Tabs>
                    <TabPanel value={value} index={0}>
                        <FileList list={filelist} onDelete={onFileDelete} onSelect={onFileSelect} />
                        <Box display="flex" flexDirection="row-reverse" p={1} m={0} bgcolor="background.paper">
                            <UploadButtons onChange={onFileChange} />
                            <div className={classes.progress}>
                                {loading && <CircularProgress id="progress" />}
                            </div>
                        </Box>
                </TabPanel>
                <TabPanel value={value} index={1}>
                        <div className={classes.text}>
                            <TextField id="filled-basic" label="Packrat" />
                        </div>
                </TabPanel>
            </Paper>
            <Paper className={classes.paper_program}>
                <ButtonProgram title="PROGRAM"/>
            </Paper>
        </div>
        </UserContext.Provider>
    );
}


 
/**
* A Counter Lumino Widget that wraps a CounterComponent.
*/
export class TabPanelUiWidget extends ReactWidget {
/**
* Constructs a new CounterWidget.
*/
    constructor() {
        super();
        this.addClass('jp-ReactWidget');
    }

    handleChangeFile(e: React.ChangeEvent<HTMLInputElement>) {
        console.log(e.currentTarget.files);
    }

    render(): JSX.Element {
        return <VerticalTabs onFileChange={this.handleChangeFile} />;
    }
}
