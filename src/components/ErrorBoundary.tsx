import { Component, ReactNode } from "react";
import { debug } from "../utils/debugger";

type Props = {
  children: ReactNode;
};

export default class ErrorBoundary extends Component<Props> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error) {
    // You can also log the error to an error reporting service
    debug("ErrorBoundary", error.message);
  }

  render() {
    return this.props.children;
  }
}
