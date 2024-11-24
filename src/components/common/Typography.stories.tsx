import { Meta, StoryFn, StoryObj } from "@storybook/react";
import { H1, H2, H3, H4, H5, H6, P3, P4, L1, L2 } from "./Typography";

const Template: StoryFn<typeof H1> = () => (
  <div
    style={{
      display: "flex",
      flexFlow: "column",
      gap: "20px",
    }}
  >
    <H1>This is an H1 Heading</H1>
    <H2>This is an H2 Heading</H2>
    <H3>This is an H3 Heading</H3>
    <H4>This is an H4 Heading</H4>
    <H5>This is an H5 Heading</H5>
    <H6>This is an H6 Heading</H6>
    <P3>This is a P3 paragraph</P3>
    <P3 className="font-semibold">This is a P3 paragraph (Semibold)</P3>
    <P4>This is a P4 paragraph</P4>
    <P4 className="font-light">This is a P4 paragraph (Light)</P4>
    <L1>This is an L1 label</L1>
    <L1 className="font-semibold">This is an L1 label (Semibold)</L1>
    <L2>This is an L2 label</L2>
    <L2 className="font-bold">This is an L2 label (Bold)</L2>
  </div>
);

export const AllTypesets: StoryObj = {
  render: () => <Template />,
};

export default {
  component: H1,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
} as Meta<typeof H1>;
