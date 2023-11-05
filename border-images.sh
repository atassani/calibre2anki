#!/usr/bin/env bash

# Set the input and output directories
input_directory="output/images/"
output_directory="output/images/"

# Define the gray border color
new_border_color="gray95"

# Define the threshold for considering a color as white
threshold=0.65

# Define the border width to sample from (in pixels)
border_width=5

# Iterate over the images in the input directory
for input_file in "$input_directory"*.jpg; do
  # Get the image dimensions
  dimensions=$(identify -format "%w %h" "$input_file")
  read -a image_dimensions <<< "$dimensions"

  # Calculate the border area coordinates
  left=$((border_width))
  top=$((border_width))
  right=$((image_dimensions[0] - border_width))
  bottom=$((image_dimensions[1] - border_width))

  # Extract the RGB values of the border area
  border_color=$(convert "$input_file" -crop "$((right - left))x$((bottom - top))+$left+$top" -format "%[fx:mean.r] %[fx:mean.g] %[fx:mean.b]" info:)

  # Split the mean values into R, G, and B components
  read -a rgb_values <<< "$border_color"

  # Check if the border color is white based on the threshold
  if (( $(bc <<< "${rgb_values[0]} >= $threshold") )) && \
     (( $(bc <<< "${rgb_values[1]} >= $threshold") )) && \
     (( $(bc <<< "${rgb_values[2]} >= $threshold") )); then
    #echo "Border is white: $input_file"
    # Add a gray border to the image and save it in the output directory
    convert "$input_file" -bordercolor "$new_border_color" -border 1x1 "$output_directory$(basename "$input_file")"
  #else
    #echo "Border is not white: $input_file"
    # If the image doesn't meet the condition, just copy it to the output directory
    #cp "$input_file" "${output_directory}$(basename "$input_file")"
  fi
done
