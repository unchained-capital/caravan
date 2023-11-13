import React from "react";

// Components
import { Card, CardHeader, CardContent } from "@mui/material";

const Disclaimer = () => (
  <Card>
    <CardHeader title="Disclaimer" />
    <CardContent>
      <small>
        This application is in “alpha” state and is presented for evaluation and
        testing only. It is provided “as is,” and any express or implied
        warranties, including but not limited to the implied warranties of
        merchantability and fitness for a particular purpose, are disclaimed. By
        using this application, you accept all risks of such use, including full
        responsibility for any direct or indirect loss of any kind resulting
        from the use of this application, which may involve complete loss of any
        Bitcoin or other coins associated with addresses used with this
        application. In no event shall Unchained Capital, Inc., its employees
        and affiliates, or developers of this application be liable for any
        direct, indirect, incidental, special, exemplary, or consequential
        damages (including, but not limited to, procurement of substitute goods
        or services; loss of use, data, or profits; or business interruption)
        however caused and on any theory of liability, whether in contract,
        strict liability, or tort (including negligence or otherwise) arising in
        any way out of the use of this application, even if advised of the
        possibility of such damage.
      </small>
    </CardContent>
  </Card>
);

export default Disclaimer;
