import React from 'react';
import PropTypes from 'prop-types';
import {
  PENDING,
  UNSUPPORTED,
  HermitSignTransaction,
} from "unchained-wallets";

// Components
import {
  Grid,
  Box,
  TextField,
  Button,
  FormHelperText,
  Table, TableHead, TableBody,
  TableRow, TableCell,
} from '@material-ui/core';
import HermitReader from "../Hermit/HermitReader";
import HermitDisplayer from "../Hermit/HermitDisplayer";
import WalletFeedback from '../WalletFeedback';

class HermitSignatureImporter extends React.Component {

  static propTypes =  {
    network: PropTypes.string.isRequired,
    inputs: PropTypes.array.isRequired,
    outputs: PropTypes.array.isRequired,
    fee: PropTypes.string.isRequired,
    signatureImporter: PropTypes.shape({}).isRequired,
    resetBIP32Path: PropTypes.func.isRequired,
    defaultBIP32Path: PropTypes.string.isRequired,
    validateAndSetBIP32Path: PropTypes.func.isRequired,
    validateAndSetSignature: PropTypes.func.isRequired,
    enableChangeMethod: PropTypes.func.isRequired,
    disableChangeMethod: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      bip32PathError: '',
      bip32PathFinalized: false,
      signatureError: '',
      walletState: (this.interaction(true).isSupported() ? PENDING : UNSUPPORTED),
    };
  }

  interaction = () => {
    const {signatureImporter, network, inputs, outputs} = this.props;
    // Sign all inputs with the same BIP32 path because we currently
    // assume each input is attached to the same address, hence redeem
    // script, hence public key, hence BIP32 path.
    //
    // This will need to be changed if we are signing inputs across
    // addresses.
    const bip32Paths = inputs.map((input) => (signatureImporter.bip32Path));
    return new HermitSignTransaction({network, inputs, outputs, bip32Paths});
  }

  render = () => {
    const {signatureImporter, disableChangeMethod, resetBIP32Path} = this.props;
    const {bip32PathError, signatureError, walletState} = this.state;
    const interaction = this.interaction();
    if (walletState === UNSUPPORTED) {
      return (
        <WalletFeedback messages={interaction.messagesFor({walletState})} excludeCodes={["hermit.signature_request", "hermit.command"]}/>
      );
    }
    return (
      <Box mt={2}>

        <Grid container>

          <Grid item md={10}>
            <TextField
              name="bip32Path"
              value={signatureImporter.bip32Path}
              onChange={this.handleBIP32PathChange}
              disabled={walletState !== PENDING}
              error={this.hasBIP32PathError()}
              helperText={bip32PathError}
            />
          </Grid>

          <Grid item md={2}>
            {!this.bip32PathIsDefault() && 
             <Button type="button" variant="contained" size="small" onClick={resetBIP32Path} disabled={walletState !== PENDING}>Default</Button>}
          </Grid>

        </Grid>

        <FormHelperText>Use the default value if you don&rsquo;t understand BIP32 paths.</FormHelperText>


         <Box mt={2}>

           <Grid container justify="center">
             <Grid item>
               <HermitDisplayer width={400} string={interaction.messageFor({code: "hermit.signature_request"}).encodedData} />
             </Grid>
           </Grid>

           {this.renderDeviceConfirmInfo()}

           <HermitReader
             startText="Scan Signature QR Code"
             interaction={interaction}
             onStart={disableChangeMethod}
             onSuccess={this.import}
             onClear={this.clear} />

           <WalletFeedback messages={interaction.messagesFor({walletState})} excludeCodes={["hermit.signature_request", "hermit.command"]}/>

           <FormHelperText error>{signatureError}</FormHelperText>
         </Box>
      </Box>
    );
  }

  renderDeviceConfirmInfo = () => {
    const {fee} = this.props;

    return (
      <Box>
        <p>Hermit will ask you to verify the following information:</p>
        <Table>
          <TableHead>
            <TableRow hover>
                <TableCell></TableCell>
              <TableCell>Amount (BTC)</TableCell>
            </TableRow>
          </TableHead>
          <TableHead>
            <TableRow>
              <TableCell>Inputs</TableCell><TableCell>&nbsp;</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {this.renderInputs()}
          </TableBody>
          <TableHead>
            <TableRow>
              <TableCell>Outputs</TableCell><TableCell>&nbsp;</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {this.renderOutputs()}
          <TableRow hover>
            <TableCell>Fee</TableCell>
            <TableCell>{fee}</TableCell>
          </TableRow>
          </TableBody>
        </Table>
      </Box>
    )
  }

  renderInputs = () => {
    const { inputs, signatureImporter } = this.props;
    console.log('renderInputs', inputs)
    return inputs.map((input, i) => {
      return (
      <TableRow hover key={i}>
        <TableCell><code>{input.multisig.address} - {signatureImporter.bip32Path}</code></TableCell>
        <TableCell>{input.amount}</TableCell>
      </TableRow>
      );
    });
  }

  renderOutputs = () => {
    const { outputs } = this.props;
    return outputs.map((output, i) => {
      return (
      <TableRow hover key={i}>
        <TableCell><code>{output.address}</code></TableCell>
        <TableCell>{output.amount}</TableCell>
      </TableRow>
      );
    });
  }


  import = (signature) => {
    console.log("IMPORTED SIGNATURE:", signature);
    const { validateAndSetSignature, enableChangeMethod } = this.props;
    this.setState({signatureError: ''});
    enableChangeMethod();
    validateAndSetSignature(
      signature,
      (signatureError) => {this.setState({signatureError});}
    );
  }

  clear = () => {
    const { resetBIP32Path, enableChangeMethod } = this.props;
    resetBIP32Path();
    this.setState({signatureError: ''});
    enableChangeMethod();
  }

  hasBIP32PathError = () => (this.state.bip32PathError !== '')

  handleBIP32PathChange = (event) => {
    const {validateAndSetBIP32Path} = this.props;
    const bip32Path = event.target.value;
    validateAndSetBIP32Path(bip32Path, () => {}, (bip32PathError) => {this.setState({bip32PathError});});
  }

  bip32PathIsDefault = () => {
    const {signatureImporter, defaultBIP32Path} = this.props;
    return signatureImporter.bip32Path === defaultBIP32Path;
  }

}

export default HermitSignatureImporter;
