import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./Button";
import { useState } from "react";

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

const ButtonWithHooks = ({
  type,
}: {
  type: "primary" | "secondary" | "error" | "success" | undefined;
}) => {
  // Sets the hooks for both the label and primary props
  const [loading, setLoading] = useState(false);

  // Sets a click handler to change the label's value
  const handleOnChange = () => {
    setLoading((prev) => !prev);
  };
  return (
    <Button type={type} loading={loading} onClick={handleOnChange}>
      Hello There!
    </Button>
  );
};

export const Primary: Story = {
  render: () => <ButtonWithHooks type="primary" />,
};

export const PrimaryOutlined: Story = {
  args: {
    type: "primary",
    outlined: true,
    children: "primary",
  },
};

export const Secondary: Story = {
  render: () => <ButtonWithHooks type="secondary" />,
};

export const SecondaryOutlined: Story = {
  args: {
    type: "secondary",
    outlined: true,
    children: "secondary",
  },
};

export const Error: Story = {
  args: {
    type: "error",
    children: "This is an error",
  },
};

export const ErrorOutlined: Story = {
  args: {
    type: "error",
    outlined: true,
    children: "this is an error",
  },
};

export const Success: Story = {
  args: {
    type: "success",
    children: "this is success",
  },
};

export const SuccessOutlined: Story = {
  args: {
    type: "success",
    outlined: true,
    children: "this is success",
  },
};
