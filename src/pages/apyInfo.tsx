import { Helmet } from "react-helmet";
import { Box, List, ListItem, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import { Layout } from "../components/Layout";

const APYInfoPage = () => {
  const containerStyle = { maxWidth: "66ch", fontSize: "18px" };

  const linkStyle = {
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  };

  return (
    <Layout>
      <Helmet>
        <title>Staking Explained | Carmine Options AMM</title>
        <meta
          name="description"
          content="Find out how staking on Carmine Options AMM works"
        />
      </Helmet>
      <Box sx={containerStyle}>
        <RouterLink style={linkStyle} to="/staking">
          <ArrowBack />{" "}
          <Typography sx={{ pl: 2 }} variant="h4">
            Understanding Annual Percentage Yield
          </Typography>
        </RouterLink>
        <Typography sx={{ my: 2 }} variant="h5">
          What is APY?
        </Typography>
        <Typography>
          Annual Percentage Yield (APY) is a crucial financial metric used to
          measure the potential rate of return on an investment or deposit
          account over the course of one year. Unlike the nominal interest rate,
          which only accounts for the base interest earned, APY takes into
          consideration the compounding effect. It provides a more accurate
          representation of the actual yield, as it incorporates the interest
          earned on the initial investment, as well as the interest earned on
          any previously accumulated interest.
        </Typography>
        <Typography sx={{ my: 2 }} variant="h5">
          Calculating APY from Last Week Results
        </Typography>
        <Typography>
          At our company, we understand the importance of providing accurate and
          transparent information to our clients. To calculate APY based on the
          results from the previous week, we utilize a compounding formula. This
          formula takes into account the interest earned during the week and
          compounds it over the course of a year. By utilizing the weekly
          results, we can provide you with a realistic estimate of the potential
          yield of your investment. This method is especially beneficial when
          compounding occurs more frequently, allowing for a more precise
          assessment of your returns.
        </Typography>
        <Typography sx={{ my: 2 }} variant="h5">
          Why Consider APY?
        </Typography>
        <Typography>
          APY offers several advantages when it comes to assessing investment
          options:
        </Typography>
        <List>
          <ListItem>
            <Typography>
              Accurate Comparison: APY allows you to compare different
              investment products on an equal footing. By considering the
              compounding effect, it provides a standardized metric for
              evaluating the potential returns of various options.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              Realistic Expectations: Calculating APY based on the previous
              week's results provides a more current and relevant estimate of
              potential earnings. It helps you make informed decisions by
              considering the most recent performance of your investment.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              Incorporating Compounding: The compounding effect can
              significantly impact your overall returns. APY captures this
              effect, ensuring that you have a comprehensive understanding of
              the potential growth of your investment over time.
            </Typography>
          </ListItem>
        </List>
        <Typography sx={{ my: 2 }} variant="h5">
          Understanding the Risks
        </Typography>
        <Typography>
          While APY is a valuable tool for assessing potential returns, it is
          important to be aware of the associated risks:
        </Typography>
        <List>
          <ListItem>
            <Typography>
              Market Volatility: Investments are subject to market fluctuations,
              which can impact the APY. It is essential to understand that past
              performance may not guarantee future results.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              External Factors: Economic conditions, changes in interest rates,
              or regulatory developments can influence the performance of your
              investment. Staying informed about market trends and adjusting
              your strategy accordingly is crucial.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              Investment Risk: Different investments carry varying degrees of
              risk. Higher-yielding options often come with increased risk.
              Evaluate your risk tolerance and investment objectives before
              making any decisions.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography>
              Fees and Expenses: Some investments may have associated fees or
              expenses that can affect the overall APY. It is important to
              consider these costs when assessing the potential returns.{" "}
            </Typography>
          </ListItem>
        </List>

        <Typography sx={{ my: 2 }} variant="h5">
          Conclusion
        </Typography>
        <Typography>
          APY is an essential tool for evaluating the potential rate of return
          on your investments or deposit accounts. By calculating APY based on
          the results from the previous week, our company provides you with a
          reliable estimate of the potential yield. However, it is important to
          understand the potential risks involved and to make informed decisions
          based on your individual financial goals and risk tolerance.
        </Typography>
        <Typography>
          At our company, we strive to empower our clients by providing
          transparent and accurate information regarding APY. We believe that by
          understanding APY and its implications, you can make well-informed
          investment decisions to help achieve your financial objectives.
        </Typography>
      </Box>
    </Layout>
  );
};

export default APYInfoPage;
