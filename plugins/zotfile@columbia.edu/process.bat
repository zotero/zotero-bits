@echo off
REM For processing captured images from JPG to PBM to DjVu.
REM Takes one argument-- the input without the extension
REM Exits with value of 200 if all is well.

:: Set library executables
set magick="c:\Documents and Settings\Avram\My Documents\ImageMagick-6.6.6-3\convert.exe"
::set djvu="c:\Program Files\minidjvu\minidjvu.exe"
set djvu="c:\Program Files\DjVuZone\DjVuLibre\cjb2.exe"
:: Whether we should prompt for new filename
set promptname=FALSE
:: Destination directory
set destDir=c:\Documents and Settings\Avram\My Documents\Academic Large Documents\Kazanskii Telegraf-Proc
:: File name stem for generated names
set stem=Al-Islakh-1907-

::set extens=jpg
::set extensCap=JPG
set extens=tif
set extensCap=TIF


:: Exit code
set code=-1

IF [%1]==[] (
echo Usage: process.bat input-file [-b]
echo input-file should be a JPG, can omit extension
echo -b sets batch mode; no pauses, exit on completion
GOTO :EOF
)

set file=%1

:: Remove quotes
SET _string=###%file%###
SET _string=%_string:"###=%
SET _string=%_string:###"=%
SET _string=%_string:###=%
echo "%_string%.JPG"

:: We try to be flexible and accept with or without the extension
IF NOT EXIST %file% (
IF EXIST "%_string%.%extens%" (
set file=%_string%
GOTO :PROCESS
)
IF EXIST "%_string%.%extensCap%" (
set file=%_string%
GOTO :PROCESS
)
echo Input file not found: %1
GOTO :END
)
set file=%file:.%extens%=%
set file=%file:.%extensCap%=%

:PROCESS
:: Remove quotes
SET _string=###%file%###
SET _string=%_string:"###=%
SET _string=%_string:###"=%
SET file=%_string:###=%
echo Processing %file%

IF %promptname%==TRUE (
set /p name=New file name %stem%
echo %name%
echo move %1 "%destdir%\%stem%%name%.%extens%"
move %1 "%destdir%\%stem%%name%.%extens%"
set file=%destdir%\%stem%%name%
) ELSE (
GOTO :CONVERSIONS
)

IF NOT EXIST "%file%.%extens%" (
echo Moved file not found.
GOTO :END
)

:CONVERSIONS
:: First use ImageMagick to make a PBM
echo Converting to PBM
::echo %magick% "%file%.%extens%" "%file%.pbm"
%magick% "%file%.%extens%" "%file%.pbm"
IF NOT EXIST "%file%.pbm" (
echo Converted PBM not found.
GOTO :END
)
:: Now use the DjVu utility to make a DjVu
echo Converting to DjVu
::echo %djvu% "%file%.pbm" "%file%.djvu"
:: Now convert it to DjVu
%djvu% "%file%.pbm" "%file%.djvu"
IF NOT EXIST "%file%.djvu" (
echo Converted DjVu not found.
GOTO :END
)
:: Delete the PBM, now that we have the DjVu
del "%file%.pbm"
set code=200
GOTO :END

:: End routine-- exit with exit code if in batch mode
:: otherwise print exit code and just jump to EOF
:END
IF "%2"=="-b" EXIT %code%
echo Exit code %code%
pause
GOTO :EOF
