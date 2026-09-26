import PropTypes from "prop-types"
import Skeleton from "./Skeleton"
import ErrorFallback from "./ErrorFallback"

export function withLoader(Component) {
  function WithLoader({ isLoading, error, onRetry, skeletonLines = 6, ...props }) {
    if (isLoading) return <Skeleton lines={skeletonLines} />
    if (error) return <ErrorFallback message={error} onRetry={onRetry} />
    return <Component {...props} />
  }

  WithLoader.displayName = `WithLoader(${Component.displayName || Component.name || "Component"})`

  WithLoader.propTypes = {
    isLoading: PropTypes.bool,
    error: PropTypes.string,
    onRetry: PropTypes.func,
    skeletonLines: PropTypes.number,
  }

  return WithLoader
}
