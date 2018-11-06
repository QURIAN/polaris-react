import * as React from 'react';
import {noop} from '@shopify/javascript-utilities/other';
import {autobind} from '@shopify/javascript-utilities/decorators';
import {classNames} from '@shopify/react-utilities/styles';
import {arraysAreEqual} from '../../utilities/arrays';
import {withAppProvider, WithAppProviderProps} from '../AppProvider';

import * as styles from './Image.scss';

export interface SourceSet {
  source: string;
  descriptor?: string;
}

export type CrossOrigin = 'anonymous' | 'use-credentials' | '' | undefined;

export interface State {
  hasError: boolean;
  hasLoaded: boolean;
}

export interface Props extends React.HTMLProps<HTMLImageElement> {
  alt: string;
  className?: string;
  source: string;
  sourceSet?: SourceSet[];
  onError?(): void;
}

export type CombinedProps = Props & WithAppProviderProps;

export class Image extends React.PureComponent<CombinedProps, State> {
  state: State = {
    hasError: false,
    hasLoaded: false,
  };

  ComponentDidUpdate({
    source: previousSource,
    sourceSet: previousSourceSet = [],
  }: Props) {
    const {source, sourceSet = []} = this.props;
    if (
      previousSource !== source ||
      !arraysAreEqual(sourceSet, previousSourceSet)
    ) {
      this.setState({hasError: false, hasLoaded: false});
    }
  }

  render() {
    const {
      sourceSet,
      source,
      crossOrigin,
      onError,
      className,
      ...rest
    }: Props = this.props;
    const {hasError = false, hasLoaded = false} = this.state;

    if (hasError) {
      return null;
    }

    const mergedClassNames = classNames(
      className && className,
      styles.hidden,
      hasLoaded && styles.visible,
    );

    const finalSourceSet = sourceSet
      ? sourceSet
          .map(
            ({source: subSource, descriptor}) => `${subSource} ${descriptor}`,
          )
          .join(',')
      : null;

    return finalSourceSet ? (
      // eslint-disable-next-line jsx-a11y/alt-text
      <img
        src={source}
        onError={this.handleError}
        onLoad={this.handleLoad}
        srcSet={finalSourceSet}
        crossOrigin={crossOrigin as CrossOrigin}
        className={mergedClassNames}
        {...rest}
      />
    ) : (
      // eslint-disable-next-line jsx-a11y/alt-text
      <img
        src={source}
        onError={this.handleError}
        onLoad={this.handleLoad}
        className={mergedClassNames}
        crossOrigin={crossOrigin as CrossOrigin}
        {...rest}
      />
    );
  }

  @autobind
  handleError() {
    const {onError = noop} = this.props;
    onError();
    this.setState({hasError: true});
  }

  @autobind
  handleLoad() {
    this.setState({hasLoaded: true});
  }
}

export default withAppProvider<Props>()(Image);
