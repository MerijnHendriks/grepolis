using Microsoft.Win32;
using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media.Imaging;

namespace Game.Client.Views
{
    /// <summary>
    /// Interaction logic for CityView.xaml
    /// </summary>
    public partial class CityView : UserControl
    {
        public CityView()
        {
            InitializeComponent();
        }

        private void AddButtonClick(object sender, RoutedEventArgs e)
        {
            OpenFileDialog dialog = new OpenFileDialog();
            dialog.Filter = "Image Files (*.jpg; *.jpeg; *.gif; *.bmp; *.png)|*.jpg; *.jpeg; *.gif; *.bmp; *.png";

            if ((bool)dialog.ShowDialog())
            {
                // load image
                BitmapImage bitmap = new BitmapImage(new Uri(dialog.FileName));
                Image image = new Image { Source = bitmap };

                // display image
                Canvas.SetLeft(image, -(bitmap.Width / 2));
                Canvas.SetTop(image, -(bitmap.Height / 2) + 200);
                canvas.Children.Add(image);
            }
        }

        private Image draggedImage;
        private Point mousePosition;

        private void CanvasMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            Image image = (Image)e.Source;

            if (image != null && canvas.CaptureMouse())
            {
                mousePosition = e.GetPosition(canvas);
                draggedImage = image;
            }
        }

        private void CanvasMouseLeftButtonUp(object sender, MouseButtonEventArgs e)
        {
            if (draggedImage != null)
            {
                canvas.ReleaseMouseCapture();
                draggedImage = null;
            }
        }

        private void CanvasMouseMove(object sender, MouseEventArgs e)
        {
            if (draggedImage != null)
            {
                Point position = e.GetPosition(canvas);
                Vector offset = position - mousePosition;
                mousePosition = position;
                Canvas.SetLeft(draggedImage, Canvas.GetLeft(draggedImage) + offset.X);
                Canvas.SetTop(draggedImage, Canvas.GetTop(draggedImage) + offset.Y);
            }
        }
    }
}
