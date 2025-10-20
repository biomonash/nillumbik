package importer

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// FileInfo represents metadata about a file from the CSV
type FileInfo struct {
	OriginalPath string // The absolute path from CSV
	RelativePath string // Converted relative path
	FileName     string
	Exists       bool
	IsOneDrive   bool
}

// FileParser handles parsing and converting file paths from CSV
type FileParser struct {
	baseDir      string // Base directory for relative paths
	oneDriveRoot string // OneDrive root path if applicable
}

// NewFileParser creates a new file parser
func NewFileParser(baseDir string) *FileParser {
	// Try to detect OneDrive root
	oneDriveRoot := detectOneDriveRoot()

	return &FileParser{
		baseDir:      baseDir,
		oneDriveRoot: oneDriveRoot,
	}
}

// ParseFilePath converts an absolute file path to a relative path
func (fp *FileParser) ParseFilePath(absolutePath string) (*FileInfo, error) {
	if absolutePath == "" {
		return nil, fmt.Errorf("empty file path")
	}

	info := &FileInfo{
		OriginalPath: absolutePath,
		FileName:     filepath.Base(absolutePath),
	}

	// Check if it's a OneDrive path
	if fp.oneDriveRoot != "" && strings.Contains(absolutePath, fp.oneDriveRoot) {
		info.IsOneDrive = true
	}

	// Convert to relative path
	relativePath, err := fp.convertToRelativePath(absolutePath)
	if err != nil {
		// If conversion fails, use just the filename
		relativePath = info.FileName
	}
	info.RelativePath = relativePath

	// Check if file exists
	info.Exists = fp.fileExists(absolutePath)

	return info, nil
}

// convertToRelativePath converts absolute path to relative
func (fp *FileParser) convertToRelativePath(absolutePath string) (string, error) {
	// Clean the paths
	cleanAbsolute := filepath.Clean(absolutePath)
	cleanBase := filepath.Clean(fp.baseDir)

	// Try to make it relative to base directory
	relPath, err := filepath.Rel(cleanBase, cleanAbsolute)
	if err != nil {
		// If that fails, try relative to OneDrive root
		if fp.oneDriveRoot != "" {
			relPath, err = filepath.Rel(fp.oneDriveRoot, cleanAbsolute)
			if err != nil {
				return "", err
			}
		} else {
			return "", err
		}
	}

	// Convert backslashes to forward slashes for consistency
	relPath = filepath.ToSlash(relPath)

	return relPath, nil
}

// fileExists checks if a file exists at the given path
func (fp *FileParser) fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// detectOneDriveRoot tries to detect the OneDrive root directory
func detectOneDriveRoot() string {
	// Common OneDrive paths on Windows
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return ""
	}

	possiblePaths := []string{
		filepath.Join(homeDir, "OneDrive"),
		filepath.Join(homeDir, "OneDrive - Personal"),
		filepath.Join(homeDir, "OneDrive - Business"),
	}

	for _, path := range possiblePaths {
		if _, err := os.Stat(path); err == nil {
			return path
		}
	}

	return ""
}

// ParseFileColumn parses a file path column from CSV row
// Returns the FileInfo or nil if the column is empty/invalid
func (fp *FileParser) ParseFileColumn(column string) (*FileInfo, error) {
	column = strings.TrimSpace(column)
	if column == "" {
		return nil, nil // Empty column is valid, just no file
	}

	return fp.ParseFilePath(column)
}

// CreatePlaceholderFile creates a fake/placeholder file for testing
// This is the temporary solution mentioned in the meeting
func (fp *FileParser) CreatePlaceholderFile(info *FileInfo, targetDir string) error {
	if info == nil {
		return fmt.Errorf("file info is nil")
	}

	targetPath := filepath.Join(targetDir, info.RelativePath)

	// Create directory if it doesn't exist
	dir := filepath.Dir(targetPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	// Create placeholder file
	file, err := os.Create(targetPath)
	if err != nil {
		return fmt.Errorf("failed to create placeholder file: %w", err)
	}
	defer file.Close()

	// Write placeholder content
	content := fmt.Sprintf("Placeholder for: %s\nOriginal path: %s\n",
		info.FileName, info.OriginalPath)
	if _, err := file.WriteString(content); err != nil {
		return fmt.Errorf("failed to write placeholder content: %w", err)
	}

	return nil
}

// DownloadFromOneDrive downloads a file from OneDrive
// This is a placeholder for the long-term server solution
func (fp *FileParser) DownloadFromOneDrive(info *FileInfo, targetDir string) error {
	// TODO: Implement actual OneDrive API integration
	// For now, just create a placeholder
	return fp.CreatePlaceholderFile(info, targetDir)
}

// ParseCSVFileColumns parses all file-related columns from a CSV row
func ParseCSVFileColumns(row []string, parser *FileParser, fileColumnIndices []int) ([]*FileInfo, error) {
	var files []*FileInfo

	for _, idx := range fileColumnIndices {
		if idx >= len(row) {
			continue
		}

		fileInfo, err := parser.ParseFileColumn(row[idx])
		if err != nil {
			return nil, fmt.Errorf("failed to parse file column %d: %w", idx, err)
		}

		if fileInfo != nil {
			files = append(files, fileInfo)
		}
	}

	return files, nil
}
