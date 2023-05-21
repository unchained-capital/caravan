import React from "react";
import { connect } from "react-redux";
import { TEST_FIXTURES } from "unchained-bitcoin";
import { Grid } from "@mui/material";
import { COLDCARD } from "unchained-wallets";
import PropTypes from "prop-types";

const { bip39Phrase } = TEST_FIXTURES.keys.open_source;

class SeedBase extends React.Component {
  static renderSeedWord(word, i) {
    return (
      <li key={i}>
        <code>{word}</code>
      </li>
    );
  }

  render() {
    const { keystore } = this.props;
    return (
      <>
        <Grid container>
          <Grid item md={3}>
            <ol>{bip39Phrase.slice(0, 6).map(SeedBase.renderSeedWord)}</ol>
          </Grid>
          <Grid item md={3}>
            <ol start={7}>
              {bip39Phrase.slice(6, 12).map(SeedBase.renderSeedWord)}
            </ol>
          </Grid>
          <Grid item md={3}>
            <ol start={13}>
              {bip39Phrase.slice(12, 18).map(SeedBase.renderSeedWord)}
            </ol>
          </Grid>
          <Grid item md={3}>
            <ol start={19}>
              {bip39Phrase.slice(18, 24).map(SeedBase.renderSeedWord)}
            </ol>
          </Grid>
        </Grid>
        {keystore && keystore.type === COLDCARD && (
          <Grid style={{ marginTop: "2em", marginBottom: "2em" }}>
            If using the simulator, here&apos;s a handy command with the same
            seed phrase:
            <br />
            <code>
              ./simulator.py --seed &apos;{bip39Phrase.join(" ")}&apos;
            </code>
          </Grid>
        )}
      </>
    );
  }
}

SeedBase.propTypes = {
  keystore: PropTypes.shape({
    note: PropTypes.string,
    type: PropTypes.string,
    status: PropTypes.string,
    version: PropTypes.string,
  }),
};

SeedBase.defaultProps = {
  keystore: null,
};

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = {};

const Seed = connect(mapStateToProps, mapDispatchToProps)(SeedBase);

export default Seed;
