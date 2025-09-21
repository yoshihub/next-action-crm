<?php

// ログをリアルタイムで監視するコマンド
if (php_sapi_name() === 'cli') {
    echo "Laravel Log Monitor\n";
    echo "==================\n";
    echo "Press Ctrl+C to stop\n\n";

    $logFile = storage_path('logs/laravel.log');

    if (!file_exists($logFile)) {
        echo "Log file not found: {$logFile}\n";
        exit(1);
    }

    // ファイルの最後の位置を取得
    $lastSize = filesize($logFile);

    while (true) {
        clearstatcache();
        $currentSize = filesize($logFile);

        if ($currentSize > $lastSize) {
            $handle = fopen($logFile, 'r');
            fseek($handle, $lastSize);

            while (($line = fgets($handle)) !== false) {
                echo $line;
            }

            fclose($handle);
            $lastSize = $currentSize;
        }

        usleep(100000); // 0.1秒待機
    }
}

