import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false)
  const [fallbackDidError, setFallbackDidError] = useState(false)

  const handleError = () => {
    if (!didError && props.fallbackSrc && !fallbackDidError) {
      setDidError(true)
    } else {
      setFallbackDidError(true)
    }
  }

  // Filter out custom props that shouldn't be passed to DOM elements
  const { src, alt, style, className, fallbackSrc, ...rest } = props

  // Determine which image source to use
  let imageSrc = src
  if (didError && fallbackSrc && !fallbackDidError) {
    imageSrc = fallbackSrc
  } else if ((didError && !fallbackSrc) || fallbackDidError) {
    imageSrc = ERROR_IMG_SRC
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className} 
      style={style} 
      {...rest} 
      onError={handleError}
    />
  )
}
