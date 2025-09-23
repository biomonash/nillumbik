package utils

import (
	"fmt"
)

type HttpError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Err     error  `json:"-"`
	Detail  string `json:"detail"`
}

func NewHttpError(code int, message string, err error) HttpError {
	return HttpError{code, message, err, err.Error()}
}

func (err HttpError) Error() string {
	return fmt.Sprintf("%d: %s. Detail: %s", err.Code, err.Message, err.Err.Error())
}
