package utils

func MapSlice[K any, V any](conv func(K) V, inputs []K) []V {
	output := make([]V, len(inputs))
	for i, input := range inputs {
		output[i] = conv(input)
	}
	return output
}

func Values[K comparable, V any](inputs map[K]V) []V {
	result := make([]V, 0, len(inputs))
	for _, v := range inputs {
		result = append(result, v)
	}
	return result
}
