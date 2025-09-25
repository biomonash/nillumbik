package species

import "strings"

func CleanName(name string) string {
	return strings.ReplaceAll(name, "_", " ")
}

func CleanOptionalName(name *string) *string {
	if name == nil {
		return nil
	}
	result := strings.ReplaceAll(*name, "_", " ")
	return &result
}
