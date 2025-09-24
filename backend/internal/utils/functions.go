package utils

func MapSlice[K any, V any](conv func(K) V, inputs []K) []V {
	output := make([]V, len(inputs))
	for i, input := range inputs {
		output[i] = conv(input)
	}
	return output
}
