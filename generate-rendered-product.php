<?
error_reporting(0);

// header('Content-Type: image/jpeg');
// echo file_get_contents('../../wp-content/uploads/2020/12/MK_logo.png');
// die;

if ($_GET['s'] && $_GET['d']) {
    include "../../wp-load.php";
    $sneakerData = MKProductImage($_GET['s'], $_GET['d']);
    $_GET['design'] = $sneakerData['png'];
    $_GET['background'] = $sneakerData['colorShirtName'];
    $_GET['sneaker'] = $sneakerData['sneakerImg'];
}

$MKLogo = "https://matchkicks.com/wp-content/uploads/2020/12/MK_logo.png";

$backgroundURL = ($_GET['background'] ? strtolower($_GET['background']): "white");
$productType = ($_GET['product'] ? strtolower($_GET['product']): "t-shirt");
if ($productType == 't-shirt') {
    switch ($backgroundURL) {
        case "white":
            $backgroundURL = "https://matchkicks.com/wp-content/uploads/2020/07/MK-WhiteTshirt-MockUp-Blank.png";
            break;
        case "black":
            $backgroundURL = "https://matchkicks.com/wp-content/uploads/2020/11/MK-BlackTshirt-MockUp-Blank.png";
            break;
        case "gray":
        case "grey":
            $backgroundURL = "https://matchkicks.com/wp-content/uploads/2020/11/MK-GreyTshirt-MockUp-Blank.png";
            break;
    }
} else if ($productType == 'hoodie') {
    switch ($backgroundURL) {
        case "white":
            $backgroundURL = "https://matchkicks.com/wp-content/uploads/2021/01/MK-White-Hoodie-Mock.png";
            break;
        case "black":
            $backgroundURL = "https://matchkicks.com/wp-content/uploads/2021/01/MK-Black-Hoodie-Mock.png";
            break;
        case "gray":
        case "grey":
            $backgroundURL = "https://matchkicks.com/wp-content/uploads/2021/01/MK-Grey-Hoodie-Mock-2.png";
            break;
    }
}
$designURL = str_replace("https://", "http://", $_GET['design']);
$sneakerURL = $_GET['sneaker'];

$SAVE = md5($sneakerURL . $designURL . $backgroundURL . $productType);

$Existing = file_get_contents('render/' . $SAVE . '.jpg');
if (empty($Existing) || $_GET['force'] == 'true') {
$white = imagecreatefromjpeg("../colors/ffffff.jpg");
$i = 0;
 do {
//$designURL = 'https://matchkicks.com/wp-content/uploads/2020/12/MK_logo.png';
    $design = imagecreatefrompng($designURL);
    $i++;
 } while ($design === false && $i <= 4);
//$design = imagecreatefrompng($designURL);
$MKLogo = imagecreatefrompng($MKLogo);
$sneaker = imagecreatefrompng($sneakerURL);
$background = imagecreatefrompng($backgroundURL);

list($mkLogoWidth, $mkLogoHeight) = getimagesize($MKLogo);
list($width, $height) = getimagesize($backgroundURL);
list($newwidth, $newheight) = getimagesize($designURL);

// Convert to Standard Heights, despite some designers making designs in different heights.
$MKStandardWidth = 1008;
$MKStandardHeight = 1152;

$newwidth = $MKStandardHeight / $newheight * $newwidth;
$newheight = $MKStandardHeight;

list($swidth, $sheight) = getimagesize($sneakerURL);
$out = imagecreatetruecolor($MKStandardWidth, $MKStandardHeight);
imagefill($out, 0, 0, imagecolorallocate($out, 255, 255, 255));  // white background;
//imagecopyresampled ( $dst_image , $src_image , $dst_x , $dst_y , $src_x , $src_y , $dst_w , $dst_h , $src_w , $src_h ) 
imagecopyresampled($out, $background, 0, 0, 0, 0, $MKStandardWidth, $MKStandardHeight, $width, $height);

if ($productType == 't-shirt') {
    imagecopyresampled($out, $design, ($MKStandardWidth/2)/2+20, 250, 0, 0, ($MKStandardWidth-100)*0.5, ($newheight-100)*0.5, $MKStandardWidth, $newheight);
} else if ($productType == 'hoodie') {
    imagecopyresampled($out, $design, ($MKStandardWidth/2)/2+55, 250, 0, 0, (($MKStandardWidth-220)*0.5), (($newheight-220)*0.5), $MKStandardWidth, $newheight);   
}

if (!$_GET['hideSneaker'])
imagecopyresampled($out, $sneaker, 0, $newheight-$sheight-50, 0, 0, $swidth*1.5, $sheight*1.5, $swidth, $sheight);

imagecopyresampled($out, $MKLogo, 1008-1920/10, 0, 0, 0, 1920/10, 1047/10, 1920, 1047);

if ($_GET['temp']) {
    $tempURL = "../temp/rendered-product-" . time() . ".jpg";
    imagejpeg($out, $tempURL);
    echo "https://matchkicks.com/scripts/" . $tempURL;
} else {
    $SAVEURL = "render/" . $SAVE . ".jpg";
    imagejpeg($out, $SAVEURL);
    
    header('Content-Type: image/jpeg');
    imagejpeg($out);
}
} else { 
    header('Content-Type: image/jpeg');
    echo file_get_contents('render/' . $SAVE . '.jpg');
}

?>